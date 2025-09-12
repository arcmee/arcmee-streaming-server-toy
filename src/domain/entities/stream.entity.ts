export class Stream {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public title: string,
    public description: string,
    public isLive: boolean,
  ) {}
}
