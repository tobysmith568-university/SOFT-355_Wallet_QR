export interface IEmailService {
  sendEmail(recipient: string, subject: string, body: string): Promise<void>;
  sendHTMLEmail(recipient: string, subject: string, body: string): Promise<void>;
}
