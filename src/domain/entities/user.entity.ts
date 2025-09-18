import { createId } from '@paralleldrive/cuid2';

export class User {
  readonly id: string;
  username: string;
  email: string;
  password: string;
  streamKey: string;

  constructor(props: {
    id?: string;
    username: string;
    email: string;
    password: string;
    streamKey: string;
  }) {
    this.id = props.id || createId();
    this.username = props.username;
    this.email = props.email;
    this.password = props.password;
    this.streamKey = props.streamKey;
  }
}
