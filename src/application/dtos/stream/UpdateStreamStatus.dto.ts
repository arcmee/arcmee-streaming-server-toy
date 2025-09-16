export class UpdateStreamStatusDto {
  constructor(
    public readonly streamKey: string,
    public readonly isLive: boolean,
  ) {}
}
