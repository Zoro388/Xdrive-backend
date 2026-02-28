import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  try {
    // Create transporter using Gmail
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // your Gmail App Password
      },
    });

    // Wrap HTML with a default styled container for all emails
    const styledHtml = `
      <div style="
        font-family: Arial, sans-serif;
        background-color: #f4f4f7;
        padding: 20px;
        color: #333;
      ">
        <div style="
          max-width: 600px;
          margin: 0 auto;
          background-color: #fff;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 0 10px rgba(0,0,0,0.05);
        ">
          ${html}
        </div>
      </div>
    `;

    // Send email
    await transporter.sendMail({
      from: `"XDRIVE Driving School" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html: styledHtml,
    });

    console.log(`Email sent to ${to} successfully.`);
  } catch (error) {
    console.error("Email sending error:", error);
    throw new Error("Email could not be sent");
  }
};

export default sendEmail;