import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // 🔥 use service instead of host
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // must be Gmail App Password
      },
    });

    const info = await transporter.sendMail({
      from: `"XDRIVE Driving School" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent:", info.messageId);
  } catch (error) {
    console.error("EMAIL ERROR:", error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;