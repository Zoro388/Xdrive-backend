import { sendTestEmail } from "../services/emailService.js";

export const testEmail = async (req, res) => {

try {

const { email } = req.body;

if (!email) {
return res.status(400).json({
message: "Email is required"
});
}

await sendTestEmail(email);

res.status(200).json({
message: "Email sent successfully"
});

} catch (error) {

res.status(500).json({
message: error.message
});
}
};





