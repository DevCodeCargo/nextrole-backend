import { Module } from '@nestjs/common';
import { InternalTestController } from './internal-test.controller';
import { InternalTestService } from './internal-test.service';
import { AuthModule } from 'src/common/auth/auth.module';

@Module({
  controllers: [InternalTestController],
  providers: [InternalTestService],
  imports: [AuthModule],
})
export class InternalTestModule {}
