import { User } from './user.entity';

export interface ChatMessageProps {
  id: string;
  text: string;
  createdAt: Date;
  streamId: string;
  userId: string;
  user?: User; // Optional: for populating user info
}

export class ChatMessage implements ChatMessageProps {
  id: string;
  text: string;
  createdAt: Date;
  streamId: string;
  userId: string;
  user?: User;

  constructor(props: ChatMessageProps) {
    this.id = props.id;
    this.text = props.text;
    this.createdAt = props.createdAt;
    this.streamId = props.streamId;
    this.userId = props.userId;
    this.user = props.user;
  }
}
