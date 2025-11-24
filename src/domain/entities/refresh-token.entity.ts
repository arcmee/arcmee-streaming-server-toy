import { createId } from '@paralleldrive/cuid2';

export class RefreshToken {
  readonly id: string;
  tokenHash: string;
  userId: string;
  expiresAt: Date;
  createdAt: Date;
  revokedAt: Date | null;

  constructor(props: {
    id?: string;
    tokenHash: string;
    userId: string;
    expiresAt: Date;
    createdAt?: Date;
    revokedAt?: Date | null;
  }) {
    this.id = props.id || createId();
    this.tokenHash = props.tokenHash;
    this.userId = props.userId;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt || new Date();
    this.revokedAt = props.revokedAt ?? null;
  }
}
