export class ApiResponse<T = any> {
  constructor(
    public success: boolean,
    public message: string,
    public data?: T,
    public errorCode?: string,
  ) { }

  static success<T>(data: T, message = 'Success'): ApiResponse<T> {
    return new ApiResponse(true, message, data);
  }

  static error(
    message: string,
    errorCode = 'GENERIC_ERROR',
    data?: any,
  ): ApiResponse {
    return new ApiResponse(false, message, data, errorCode);
  }
}