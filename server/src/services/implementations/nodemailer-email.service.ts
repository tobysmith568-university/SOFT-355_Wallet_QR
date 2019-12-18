/* istanbul ignore file */
/*
  This file cannot be unit tested because it interacts with the Simple Mail Transfer Protocol
*/

import Mail = require("nodemailer/lib/mailer");
import { createTransport } from "nodemailer";
import { IEmailService } from "../email.service";
import { Config } from "../../config/config";

export class NodemailerEmailService implements IEmailService {

  private static readonly SECUREPORT = 465;

  private transporter: Mail;

  constructor(private readonly config: Config) {

    this.transporter = createTransport({
      host: config.getEmailHost(),
      port: config.getEmailPort(),
      secure: config.getEmailPort() === NodemailerEmailService.SECUREPORT,
      auth: {
        user: config.getEmailUser(),
        pass: config.getEmailPass()
      }
    });
  }

  public async sendEmail(recipient: string, subject: string, body: string): Promise<void> {
    this.transporter.sendMail({
      from: this.config.getEmailUser(),
      to: recipient,
      subject: subject,
      text: body
    });
  }

  public async sendHTMLEmail(recipient: string, subject: string, body: string): Promise<void> {
    this.transporter.sendMail({
      from: this.config.getEmailUser(),
      to: recipient,
      subject: subject,
      html: body
    });
  }
}
