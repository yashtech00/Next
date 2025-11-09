import nodemailer from "nodemailer";

export const sendMagicLinkEmail = async (email: string, magicLink: string) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER!,
      pass: process.env.EMAIL_PASS!,
    },
  });

  await transporter.sendMail({
    from: `"NextAI Auth" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Magic Login Link ✨",
    html: `
      <p>Click the link below to log in:</p>
      <a href="${magicLink}">${magicLink}</a>
      <p>This link expires in 10 minutes.</p>
    `,
  });
};
