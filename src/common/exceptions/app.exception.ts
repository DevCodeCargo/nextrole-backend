import { HttpException, HttpStatus } from "@nestjs/common";

export class AppException extends HttpException {
  public readonly errorCode: string;
  public readonly originalError?: unknown;

  constructor(
    message: string,
    errorCode = "APPLICATION_ERROR",
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    originalError?: unknown,
  ) {
    super(
      {
        message,
        errorCode,
      },
      status,
    );

    this.errorCode = errorCode;
    this.originalError = originalError;
  }
}