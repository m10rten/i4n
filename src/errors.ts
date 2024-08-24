export type I4nExceptionType = "invalid-language" | "invalid-translations" | "unexpected-exception";

export class I4nException extends Error {
  public readonly type: I4nExceptionType;
  public readonly from?: Error;
  public constructor(
    { message, type, error }: { type?: I4nExceptionType; message?: string; error?: Error } = {
      message: "Unexpected exception within the `i4n` package",
      type: "unexpected-exception",
    },
  ) {
    super(`I4n: ${message}`);
    this.type = type ?? "unexpected-exception";
    this.from = error ?? undefined;
  }
}
