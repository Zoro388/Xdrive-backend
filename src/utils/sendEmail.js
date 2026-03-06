import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,          // ✅ Use 587 instead of 465
      secure: false,      // ✅ MUST be false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // 16-character app password
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