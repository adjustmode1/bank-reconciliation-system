export class CompletedTransactionCommand {
  constructor(
    public readonly fileId: string,
    public readonly recordSize: number,
  ) {}
}
