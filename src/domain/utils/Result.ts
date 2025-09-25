export type Result<T, E> = { ok: true; value: T } | { ok: false; error: E };

export const ok = <T, E>(value: T): Result<T, E> => ({ ok: true, value });

export const err = <T, E>(error: E): Result<T, E> => ({ ok: false, error });
