import { UsersEntity } from '@repo/shared-entities';
import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async send2FACode(user: UsersEntity, code: string) {
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: '2FA Code',
        template: './templates/two-fa',
        context: {
          name: user.firstName,
          code: code,
        },
      });
    } catch (e) {
      console.log('Error: error in sending verification code', e);
    }
  }
  async sendResetLink(email: string, token: string) {
    try {
      await this.mailerService.sendMail({
        to: email,
        subject: 'Password Reset',
        template: './two-fa',
        context: {
          name: email,
          code: token,
        },
      });
    } catch (e) {
      console.log('Error: error in sending verification code', e);
    }
  }
}
