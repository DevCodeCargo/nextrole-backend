import { HttpStatus } from "@nestjs/common";
import { Knex } from "knex";
import { AppException } from "src/common/exceptions/app.exception";
import { LoggerService } from "src/common/logger/logger.service";

export abstract class BaseService<TEntity, TResponse> {
  constructor(protected readonly logger: LoggerService) { }

  protected abstract mapToResponse(
    entity: TEntity,
  ): TResponse;

  protected async execute<T>(
    action: () => Promise<T>,
    message: string,
    errorCode: string,
    status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  ): Promise<T> {
    try {
      return await action();
    } catch (error) {
      if (error instanceof AppException) {
        throw error;
      }
      throw new AppException(message, errorCode, status, error);
    }
  }

  protected async runInTransaction<T>(
    db: Knex,
    action: (trx: Knex) => Promise<T>,
  ): Promise<T> {
    return db.transaction(async (trx) => {
      return action(trx);
    });
  }

  protected ensureFound<T>(
    entity: T | null | undefined,
    message: string,
    errorCode: string,
  ): T {
    if (!entity) {
      throw new AppException(message, errorCode, HttpStatus.NOT_FOUND);
    }
    return entity;
  }
}