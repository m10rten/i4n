export type I4nExceptionType = "invalid-language" | "invalid-translations";

export class I4nException extends Error {
  public readonly type: I4nExceptionType;
  public constructor({ message, type }: { type: I4nExceptionType; message: string }) {
    super(`I4n: ${message}`);
    this.type = type;
  }
}
