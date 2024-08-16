export class I4nException extends Error {
  public constructor(message: string) {
    super(`I4n: ${message}`);
  }
}
