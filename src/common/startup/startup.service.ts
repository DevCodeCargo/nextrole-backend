import { HttpStatus, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import { LoggerService } from '../logger/logger.service';

@Injectable()
export class StartupService implements OnApplicationBootstrap {
  constructor(
    private databaseService: DatabaseService,
    private logger: LoggerService,
  ) { }

  async onApplicationBootstrap() {
    try {
      await this.startup_task_list();
      this.logger.info('Startup Successful');
    } catch (ex) {
      this.logger.error('Startup failed', ex);

      // terminate app
      process.exit(1);
    }
  }

  async startup_task_list() {
    //check connection with platform db
    await this.connect_platform_db();

    //identify client
  }

  async connect_platform_db() {
    await this.databaseService.connect_platform_db();
  }
}
