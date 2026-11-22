export type I4nExceptionType = "invalid-language";

export class I4nException extends Error {
  public readonly type: I4nExceptionType;
  public constructor(type: I4nExceptionType, message: string, options?: ErrorOptions) {
    super(`I4n: ${message}`, options);
    this.name = "I4nException";
    this.type = type;
  }
}
