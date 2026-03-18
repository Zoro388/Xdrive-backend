import Contact from "../models/Contact.js";
import sendEmail from "../utils/sendEmail.js";

/*
----------------------------------
1. CREATE CONTACT MESSAGE
----------------------------------
*/
export const sendContactMessage = async (req, res) => {
  try {
    const { email, phone, message } = req.body;

    if (!email || !message) {
      return res.status(400).json({
        success: false,
        message: "Email and message are required",
      });
    }

    const newMessage = await Contact.create({
      email,
      phone,
      message,
    });

    // notify admin
    const html = `
      <h2>New Contact Message</h2>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || "Not provided"}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `;

    await sendEmail(process.env.EMAIL_USER, "New Contact Message", html);

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });

  } catch (error) {
    console.error("Contact error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};

/*
----------------------------------
2. GET ALL CONTACT MESSAGES
(Admin dashboard)
----------------------------------
*/
export const getContactMessages = async (req, res) => {
  try {
    const messages = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch messages",
    });
  }
};

/*
----------------------------------
3. MARK MESSAGE AS READ
----------------------------------
*/
export const markMessageRead = async (req, res) => {
  try {
    const message = await Contact.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    res.status(200).json({
      success: true,
      data: message,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update message",
    });
  }
};