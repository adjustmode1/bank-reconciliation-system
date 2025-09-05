export class UploadFileCommand {
  constructor(
    public readonly file: Express.MulterS3.File,
    public readonly username: string,
  ) {}
}
