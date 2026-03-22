import { resend } from "../utils/resend.js";

/*
========================================
SEND TEST EMAIL
========================================
*/

export const sendTestEmail = async (email) => {

try {

await resend.emails.send({
from: process.env.EMAIL_FROM,
to: email,
subject: "Resend Test Email",
html: `
<h2>Email Working</h2>
<p>Your X-Drive email service is working successfully.</p>
`
});

} catch (error) {
console.log("Email error:", error.message);
throw error;
}
};


/*
========================================
WELCOME EMAIL
========================================
*/

export const sendWelcomeEmail = async (email, name) => {

await resend.emails.send({

from: process.env.EMAIL_FROM,

to: email,

subject: "Welcome to X-Drive",

html: `
<h2>Hello ${name}</h2>
<p>Welcome to X-Drive Driving School.</p>
<p>Your account has been created successfully.</p>
`
});
};


/*
========================================
FORGOT PASSWORD EMAIL
========================================
*/

export const sendResetEmail = async (email, token) => {

const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}&email=${email}`;

await resend.emails.send({

from: process.env.EMAIL_FROM,

to: email,

subject: "Reset Your Password",

html: `
<h2>Password Reset</h2>
<p>Click the link below to reset your password</p>

<a href="${resetLink}">
Reset Password
</a>

<p>This link expires in 10 minutes</p>
`
});
};
