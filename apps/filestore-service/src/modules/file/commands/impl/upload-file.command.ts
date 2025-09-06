export class UploadFileCommand {
  constructor(
    public readonly file: Express.Multer.File,
    public readonly username: string,
  ) {}
}
