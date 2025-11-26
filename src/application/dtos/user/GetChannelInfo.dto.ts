export class GetChannelInfoDto {
  constructor(
    public readonly userId: string,
    public readonly includeStreamKey?: boolean,
  ) {}
}
