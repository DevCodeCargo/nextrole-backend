import { Module } from '@nestjs/common';
import { InternalTestModule } from './internal-test/internal-test.module';

@Module({
  imports: [InternalTestModule]
})
export class DomainsModule { }
