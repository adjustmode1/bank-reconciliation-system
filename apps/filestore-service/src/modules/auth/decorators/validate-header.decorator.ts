import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

export function ValidatedHeaders<T>(dtoClass: new () => T) {
  return createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<Request>();
    const rawHeaders = request.headers;

    const dtoObject = plainToInstance(dtoClass, rawHeaders, {
      enableImplicitConversion: true,
      excludeExtraneousValues: false,
    });

    const errors = validateSync(dtoObject as object, {
      whitelist: true,
      forbidNonWhitelisted: false,
    });

    if (errors.length > 0) {
      const messages = errors.flatMap((err) =>
        Object.values(err.constraints || {}).map((msg) => msg),
      );
      throw new BadRequestException(messages);
    }

    return dtoObject;
  })();
}
