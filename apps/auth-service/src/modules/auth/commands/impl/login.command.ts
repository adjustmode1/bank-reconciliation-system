export class LoginCommand {
  constructor(
    public readonly username: string,
    public readonly password: string,
    public readonly deviceId: string,
  ) {}
}
