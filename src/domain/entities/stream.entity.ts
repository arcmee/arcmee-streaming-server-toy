import { createId } from '@paralleldrive/cuid2';

export class Stream {
  readonly id: string;
  readonly userId: string;
  title: string;
  description: string;
  isLive: boolean;
  thumbnailUrl: string | null;

  constructor(props: {
    id?: string;
    userId: string;
    title: string;
    description: string;
    isLive: boolean;
    thumbnailUrl: string | null;
  }) {
    this.id = props.id || createId();
    this.userId = props.userId;
    this.title = props.title;
    this.description = props.description;
    this.isLive = props.isLive;
    this.thumbnailUrl = props.thumbnailUrl;
  }
}
