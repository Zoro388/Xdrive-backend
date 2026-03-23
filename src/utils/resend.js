import { Resend } from "resend";
import dotenv from "dotenv"

dotenv.config()

let resend;

if (!process.env.RESEND_API_KEY) {
    console.log("Resend API key missing. Email service disabled.")
} else {
    resend = new Resend(process.env.RESEND_API_KEY);
}
export default resend;