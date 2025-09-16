export class SendMessageDto {
  constructor(
    public readonly streamId: string,
    public readonly userId: string,
    public readonly text: string,
  ) {}
}
