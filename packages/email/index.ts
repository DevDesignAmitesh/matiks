import { Resend } from "resend";

class EmailService {
  private static instance: EmailService;
  private resend: Resend;

  private constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendEmail(params: {
    email: string;
    name: string;
    otp: string;
  }): Promise<{ success: boolean }> {
    try {
      await this.resend.emails.send({
        from: "hello@amitesh.work",
        to: params.email,
        subject: "OTP for authentication",
        text: params.otp,
      });
      return { success: true };
    } catch (e) {
      console.log("error while sending email ", e);
      return { success: false };
    }
  }
}

export const emailService = EmailService.getInstance();
