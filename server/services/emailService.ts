import nodemailer from 'nodemailer';
import { config } from '../config';

// Email template interface
export interface EmailTemplate {
  subject: string;
  html: string;
}

// Email options interface
export interface EmailOptions {
  to: string;
  template: EmailTemplate;
  data?: Record<string, any>;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.password,
      },
    });
  }

  // Send email using a template
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      const { to, template, data } = options;

      // Replace template variables with actual data
      let html = template.html;
      if (data) {
        Object.entries(data).forEach(([key, value]) => {
          html = html.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
      }

      await this.transporter.sendMail({
        from: config.email.from,
        to,
        subject: template.subject,
        html,
      });

      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  // Send job application confirmation email
  async sendJobApplicationConfirmation(
    candidateEmail: string,
    candidateName: string,
    jobTitle: string,
    companyName: string
  ): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `Application Received - ${jobTitle} at ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4F46E5;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px;
            }
            .content {
              padding: 20px;
              background-color: #f9fafb;
              border-radius: 5px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #4F46E5;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Application Received</h1>
          </div>
          <div class="content">
            <p>Dear {{candidateName}},</p>
            <p>Thank you for applying for the position of <strong>{{jobTitle}}</strong> at {{companyName}}.</p>
            <p>We have received your application and our team will review it shortly. We appreciate your interest in joining our team.</p>
            <p>What happens next?</p>
            <ul>
              <li>Our team will review your application</li>
              <li>If your profile matches our requirements, we will contact you for the next steps</li>
              <li>You can track your application status through our portal</li>
            </ul>
            <p>If you have any questions, please don't hesitate to reach out to us.</p>
            <a href="{{applicationPortalUrl}}" class="button">View Application Status</a>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    };

    return this.sendEmail({
      to: candidateEmail,
      template,
      data: {
        candidateName,
        jobTitle,
        companyName,
        applicationPortalUrl: `${config.appUrl}/applications`,
        currentYear: new Date().getFullYear(),
      },
    });
  }

  // Send application acceptance notification
  async sendApplicationAcceptanceNotification(
    candidateEmail: string,
    candidateName: string,
    jobTitle: string,
    companyName: string
  ): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `Application Accepted - ${jobTitle} at ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4F46E5;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px;
            }
            .content {
              padding: 20px;
              background-color: #f9fafb;
              border-radius: 5px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #4F46E5;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Application Accepted</h1>
          </div>
          <div class="content">
            <p>Dear {{candidateName}},</p>
            <p>We are pleased to inform you that your application for the position of <strong>{{jobTitle}}</strong> at {{companyName}} has been shortlisted for an interview.</p>
            <p>Our team will contact you shortly to schedule the interview and provide further details about the next steps in the process.</p>
            <p>What to expect:</p>
            <ul>
              <li>You will receive a call or email to schedule the interview</li>
              <li>Please prepare any questions you may have about the role</li>
              <li>Review the job requirements and your experience</li>
            </ul>
            <p>If you have any immediate questions, please don't hesitate to reach out to us.</p>
            <a href="{{applicationPortalUrl}}" class="button">View Application Status</a>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    };

    return this.sendEmail({
      to: candidateEmail,
      template,
      data: {
        candidateName,
        jobTitle,
        companyName,
        applicationPortalUrl: `${config.appUrl}/applications`,
        currentYear: new Date().getFullYear(),
      },
    });
  }

  // Send application rejection notification
  async sendApplicationRejectionNotification(
    candidateEmail: string,
    candidateName: string,
    jobTitle: string,
    companyName: string
  ): Promise<boolean> {
    const template: EmailTemplate = {
      subject: `Application Status Update - ${jobTitle} at ${companyName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4F46E5;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 5px;
            }
            .content {
              padding: 20px;
              background-color: #f9fafb;
              border-radius: 5px;
              margin-top: 20px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 12px;
              color: #666;
            }
            .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #4F46E5;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Application Status Update</h1>
          </div>
          <div class="content">
            <p>Dear {{candidateName}},</p>
            <p>Thank you for your interest in the position of <strong>{{jobTitle}}</strong> at {{companyName}} and for taking the time to submit your application.</p>
            <p>After careful consideration, we regret to inform you that we have decided to move forward with other candidates whose qualifications more closely match our current needs.</p>
            <p>We appreciate your interest in joining our team and wish you success in your job search and future professional endeavors.</p>
            <p>We encourage you to:</p>
            <ul>
              <li>Keep an eye on our careers page for future opportunities</li>
              <li>Update your profile to highlight relevant skills and experience</li>
              <li>Consider applying for other positions that match your qualifications</li>
            </ul>
            <p>Thank you for your understanding.</p>
            <a href="{{applicationPortalUrl}}" class="button">View Other Opportunities</a>
          </div>
          <div class="footer">
            <p>This is an automated message. Please do not reply to this email.</p>
            <p>&copy; {{currentYear}} {{companyName}}. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
    };

    return this.sendEmail({
      to: candidateEmail,
      template,
      data: {
        candidateName,
        jobTitle,
        companyName,
        applicationPortalUrl: `${config.appUrl}/jobs`,
        currentYear: new Date().getFullYear(),
      },
    });
  }
}

export const emailService = new EmailService(); 