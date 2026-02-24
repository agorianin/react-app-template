import nodemailer from "nodemailer";
import process from "process";

const {
    SMTP_HOST,
    SMTP_PORT,
    SMTP_USER,
    SMTP_PASS,
    SMTP_FROM,
    SMTP_SECURE,
} = process.env;

function createTransport() {
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
        throw new Error("Missing SMTP configuration for email delivery");
    }

    const port = Number(SMTP_PORT);
    const secure = SMTP_SECURE === "true" || port === 465;

    return nodemailer.createTransport({
        host: SMTP_HOST,
        port,
        secure,
        auth: {
            user: SMTP_USER,
            pass: SMTP_PASS,
        },
    });
}

type VerificationEmailInput = {
    to: string;
    displayName?: string | null;
    verificationLink: string;
    companyName?: string | null;
    jobTitle?: string | null;
};

export async function sendVerificationEmail({
    to,
    displayName,
    verificationLink,
}: VerificationEmailInput) {
    const transporter = createTransport();
    const safeName = displayName?.trim() || "there";
    const subject = "Verify your email for ChatGPT Mimic AI";

    const text = [
        `Hi ${safeName},`,
        "",
        "Thanks for signing up for ChatGPT Mimic AI",

        "Please verify your email address by clicking the link below:",
        verificationLink,
        "",
        "If you did not create this account, you can ignore this message.",
        "",
        "ChatGPT AI Mimic Team",
    ]
        .filter(Boolean)
        .join("\n");

    const html = `
      <div style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 32px;">
        <div style="max-width: 560px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 18px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e293b, #0f172a); padding: 18px 24px;">
            <div style="font-size: 16px; letter-spacing: 0.12em; color: #cbd5f5; text-transform: uppercase;">TalentScout AI</div>
          </div>
          <div style="padding: 26px 24px 8px;">
            <h2 style="margin: 0 0 8px; color: #0f172a;">Verify your email</h2><br>
            <p style="margin: 0 0 16px; color: #475569;">Hi ${safeName},</p>
            <p style="margin: 0 0 16px; color: #475569;">
              Thanks for signing up for ChatGPT Mimic AI. Please verify your email address to continue.
            </p>
            <div style="margin: 24px 0;">
              <a href="${verificationLink}" style="display: inline-block; padding: 12px 18px; background: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 10px; font-weight: 600;">
                Verify email
              </a>
            </div>
          </div>
          <div style="padding: 0 24px 24px;">
            <p style="margin: 0 0 12px; color: #64748b; font-size: 13px;">
              If the button does not work, copy and paste this link into your browser:
            </p>
            <p style="word-break: break-all; color: #0f172a; font-size: 13px;">${verificationLink}</p>
          </div>
          <div style="border-top: 1px solid #e2e8f0; padding: 16px 24px; background: #f8fafc;">
            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
              If you did not create this account, you can ignore this message.
            </p>
          </div>
        </div>
      </div>
    `;

    await transporter.sendMail({
        from: SMTP_FROM,
        to,
        subject,
        text,
        html,
    });
}
