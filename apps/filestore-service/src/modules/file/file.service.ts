import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { TransactionRowDto } from './dto/transaction-row.dto';
import { validateOrReject } from 'class-validator';
import ExcelJS from 'exceljs';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { FileStoreEventsProducer } from '../kafka/file-store-events.producer';

/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
@Injectable()
export class FileService {
  private readonly logger = new Logger(FileService.name);
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly domain: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly producer: FileStoreEventsProducer,
  ) {
    this.s3 = new S3Client({
      endpoint: this.configService.getOrThrow<string>('file.endpoint', {
        infer: true,
      }),
      region: this.configService.get<string>('file.region', { infer: true }),
      forcePathStyle: true,
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>('file.accessKeyId', {
          infer: true,
        }),
        secretAccessKey: this.configService.getOrThrow<string>(
          'file.secretAccessKey',
          { infer: true },
        ),
      },
    });

    this.bucket = this.configService.getOrThrow<string>(
      'file.defaultMinioBucket',
      { infer: true },
    );
    this.domain = this.configService.getOrThrow<string>('file.fileDomain', {
      infer: true,
    });
  }

  async validateAndParseFile(file: Express.Multer.File): Promise<void> {
    const ext = file.originalname.split('.').pop()?.toLowerCase();

    if (ext === 'csv') {
      await this.parseCSVStream(file.buffer);
    } else if (ext === 'xlsx') {
      await this.parseXLSXStream(file.buffer);
    } else {
      throw new UnprocessableEntityException('Invalid file type');
    }
  }

  private async parseCSVStream(buffer: Buffer) {
    const stream = Readable.from(buffer).pipe(csvParser());
    let rowIndex = 0;

    for await (const row of stream) {
      rowIndex++;
      const dto = plainToInstance(TransactionRowDto, row, {
        enableImplicitConversion: true,
      });
      try {
        await validateOrReject(dto, { whitelist: true });
      } catch (errors) {
        throw new UnprocessableEntityException({
          message: `Validation failed at row ${rowIndex}`,
          errors: errors as unknown,
        });
      }
    }
  }

  private async parseXLSXStream(buffer: Buffer | Uint8Array) {
    const workbook = new ExcelJS.Workbook();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await workbook.xlsx.load(buffer as any);

    const worksheet = workbook.worksheets[0];
    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i).values as any;
      const dto = plainToInstance(TransactionRowDto, {
        date: row[1],
        content: row[2],
        amount: row[3],
        type: row[4],
      });
      try {
        await validateOrReject(dto, { whitelist: true });
      } catch (errors) {
        throw new UnprocessableEntityException({
          message: `Validation failed at row ${i}`,
          errors,
        });
      }
    }
  }

  async uploadToS3(file: Express.Multer.File, key: string): Promise<string> {
    await this.s3.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'private',
      }),
    );
    return key;
  }

  async streamCSVAndSendKafka(buffer: Buffer, fileId: string) {
    const stream = Readable.from(buffer).pipe(csvParser());
    let rowIndex = 0;

    for await (const row of stream) {
      rowIndex++;
      const dto = plainToInstance(TransactionRowDto, row, {
        enableImplicitConversion: true,
      });
      try {
        await validateOrReject(dto, { whitelist: true });
      } catch (errors) {
        throw new UnprocessableEntityException({
          message: `Validation failed at row ${rowIndex}`,
          errors,
        });
      }

      await this.producer.sendMessage({ ...dto, fileId });
    }

    await this.producer.sendCompletedMessage({ fileId, recordSize: rowIndex });
  }

  async streamXLSXAndSendKafka(buffer: Buffer | Uint8Array, fileId: string) {
    const workbook = new ExcelJS.Workbook();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await workbook.xlsx.load(buffer as any);
    const worksheet = workbook.worksheets[0];

    for (let i = 2; i <= worksheet.rowCount; i++) {
      const row = worksheet.getRow(i).values as any;
      const dto = plainToInstance(TransactionRowDto, {
        date: row[1],
        content: row[2],
        amount: row[3],
        type: row[4],
      });
      try {
        await validateOrReject(dto, { whitelist: true });
      } catch (errors) {
        throw new UnprocessableEntityException({
          message: `Validation failed at row ${i}`,
          errors: errors as unknown,
        });
      }

      await this.producer.sendMessage({ ...dto, fileId });
    }

    await this.producer.sendCompletedMessage({
      fileId,
      recordSize: worksheet.rowCount >= 2 ? worksheet.rowCount - 2 : 0,
    });
  }

  async getFileBuffer(key: string): Promise<Buffer> {
    const result = await this.s3.send(
      new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }),
    );

    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      const stream = result.Body as Readable;
      stream.on('data', (chunk: Buffer) =>
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)),
      );
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
    });
  }

  getFileKey(path: string): string {
    return path.replace(`${this.domain}://${this.bucket}/`, '');
  }
}
