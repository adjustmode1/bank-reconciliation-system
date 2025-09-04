export class RefreshTokenCommand {
  constructor(
    public readonly username: string,
    public readonly deviceId: string,
    public readonly refreshToken: string,
  ) {}
}
