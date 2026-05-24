import { Controller, Get, Query } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('mail')
export class EmailController {

  constructor(
    private readonly mailService: EmailService
  ) { }

  @Get('test')
  async sendTest(
    @Query('email') email: string
  ) {

    await this.mailService.sendTestEmail(email);

    return {
      success: true,
      message: "Email Sent Successfully"
    };

  }
}