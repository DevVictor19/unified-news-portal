/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  IMailService,
  IMessage,
} from '@/modules/users/application/services/mail-service.interface';

export class MailServiceMock implements IMailService {
  async sendMail(message: IMessage): Promise<void> {
    return Promise.resolve();
  }
}
