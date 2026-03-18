import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail", // ← important
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // 16-char Gmail App Password
      },
    });

    await transporter.sendMail({
      from: `"XDRIVE Driving School" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    console.log("Email sent successfully");

  } catch (error) {
    console.error("EMAIL ERROR:", error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;