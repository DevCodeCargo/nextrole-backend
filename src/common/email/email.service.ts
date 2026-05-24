import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

@Injectable()
export class EmailService {

  private readonly transporter;

  constructor(
    private readonly configService: ConfigService
  ) {

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS')
      }
    });

  }

  async sendTestEmail(
    email: string
  ): Promise<void> {

    await this.transporter.sendMail({
      from: this.configService.get<string>('SMTP_USER'),
      to: email,
      subject: 'NextRole Test Email',
      html: `
        <h2>Welcome to NextRole</h2>

        <p>
          Your SMTP email integration is working successfully.
        </p>
      `
    });
  }
}