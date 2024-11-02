export type Result<T, E> = Ok<T> | Err<E>;

export class Ok<T> {
  private data: T;

  constructor (data: T) {
    this.data = data;
  }

  unwrap (): T {
    return this.data;
  }

  isOk (): boolean {
    return true;
  }

  map<R> (callback: (_: T) => R): Ok<R> {
    return new Ok(callback(this.data));
  }

  error () {
    throw new Error('Ok does not contain error messages');
  }
}

export class Err<E> {
  private err: E;

  constructor (err: E) {
    this.err = err;
  }

  unwrap (): never {
    throw new Error('Cannot unwrap Err type');
  }

  isOk (): boolean {
    return false;
  }

  map (): Err<E> {
    return this;
  }

  error (): E {
    return this.err;
  }
}

export interface Diagnostic {
  code: number;
  message: string;
}
