export class Vod {
  readonly id: string;
  readonly streamId: string;
  readonly userId: string;
  readonly title: string;
  readonly thumbnailUrl: string;
  readonly videoUrl: string;
  readonly duration: number;
  readonly createdAt: Date;
  readonly views: number;

  constructor(props: {
    id: string;
    streamId: string;
    userId: string;
    title: string;
    thumbnailUrl: string;
    videoUrl: string;
    duration: number;
    createdAt: Date;
    views: number;
  }) {
    this.id = props.id;
    this.streamId = props.streamId;
    this.userId = props.userId;
    this.title = props.title;
    this.thumbnailUrl = props.thumbnailUrl;
    this.videoUrl = props.videoUrl;
    this.duration = props.duration;
    this.createdAt = props.createdAt;
    this.views = props.views;
  }
}
