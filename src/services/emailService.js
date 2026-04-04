import resend  from "../utils/resend.js";

import dotenv from "dotenv"
dotenv.config();

/*
========================================
SOCIAL FOOTER
========================================
*/

const socialFooter = `
<div style="text-align:center; margin-top:20px;">

<a href="#" style="margin:0 10px;">
<img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" width="24"/>
</a>

<a href="#" style="margin:0 10px;">
<img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" width="24"/>
</a>

<a href="#" style="margin:0 10px;">
<img src="https://cdn-icons-png.flaticon.com/512/733/733585.png" width="24"/>
</a>

<a href="#" style="margin:0 10px;">
<img src="https://cdn-icons-png.flaticon.com/512/733/733579.png" width="24"/>
</a>

<a href="#" style="margin:0 10px;">
<img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="24"/>
</a>

<a href="#" style="margin:0 10px;">
<img src="https://cdn-icons-png.flaticon.com/512/733/733646.png" width="24"/>
</a>

</div>
`;



/*
========================================
WELCOME EMAIL
========================================
*/

export const sendWelcomeEmail = async (email, name) => {

await resend.emails.send({
from: process.env.EMAIL_FROM,
to: email,
subject: "Welcome to X-Drive Academy",
html: `

<div style="font-family:Arial; background:#f4f6f8; padding:40px;">

<div style="max-width:600px; margin:auto; background:white; border-radius:8px; overflow:hidden;">

<div style="background:#012169; padding:20px; color:white; text-align:center;">
<h2>X-Drive Academy</h2>
</div>

<div style="padding:30px;">

<h2 style="color:#012169;">Welcome ${name}</h2>

<p style="font-size:16px;">
Your account has been successfully created.
</p>

<p style="font-size:16px;">
You can now book driving lessons and make payments easily.
</p>

<div style="text-align:center; margin-top:30px;">
<a href="${process.env.FRONTEND_URL}"
style="background:#C8102E; color:white; padding:12px 20px;
text-decoration:none; border-radius:5px;">
Go to Dashboard
</a>
</div>

${socialFooter}

</div>

<div style="background:#012169; padding:15px; text-align:center; color:white;">
X-Drive Driving School © ${new Date().getFullYear()}
</div>

</div>

</div>
`
});
};



/*
========================================
RESET PASSWORD EMAIL
========================================
*/
export const sendResetEmail = async (email, token) => {

const frontendUrl =
process.env.FRONTEND_URL || "http://localhost:3000";

const resetLink =
`${frontendUrl}/reset-password?token=${token}&email=${email}`;

console.log("FRONTEND_URL:", process.env.FRONTEND_URL);
console.log("EMAIL:", email);
console.log("TOKEN:", token);
console.log("RESET LINK:", resetLink);

await resend.emails.send({
from: process.env.EMAIL_FROM,
to: email,
subject: "Reset Your Password",
html: `
<div style="font-family:Arial; background:#f4f6f8; padding:40px;">

<div style="max-width:600px; margin:auto; background:white; border-radius:8px;">

<div style="background:#012169; padding:20px; color:white; text-align:center;">
<h2>Password Reset</h2>
</div>

<div style="padding:30px;">

<h3 style="color:#012169;">Reset Your Password</h3>

<p>Click the button below to reset your password.</p>

<div style="text-align:center; margin-top:30px;">
<a href="${resetLink}"
style="background:#C8102E; color:white; padding:12px 20px;
text-decoration:none; border-radius:5px;">
Reset Password
</a>
</div>

<p style="margin-top:20px; color:#666;">
This link expires in 10 minutes.
</p>

${socialFooter}

</div>

<div style="background:#012169; padding:15px; text-align:center; color:white;">
X-Drive Driving School © ${new Date().getFullYear()}
</div>

</div>

</div>
`
});
};




/*
========================================
BOOKING EMAIL
========================================
*/

export const sendBookingEmail = async (
email,
name,
date,
time,
instructor
) => {

await resend.emails.send({
from: process.env.EMAIL_FROM,
to: email,
subject: "Booking Pending",
html: `

<div style="font-family:Arial; background:#f4f6f8; padding:40px;">

<div style="max-width:600px; margin:auto; background:white; border-radius:8px;">

<div style="background:#012169; padding:20px; color:white; text-align:center;">
<h2>Booking Confirmed</h2>
</div>

<div style="padding:30px;">

<h3 style="color:#012169;">Hello ${name}</h3>

<p>Your lesson has been booked successfully await approval from the admin.</p>

<div style="background:#f9f9f9; padding:20px; border-radius:5px;">

<p><strong>Date:</strong> ${date}</p>
<p><strong>Time:</strong> ${time}</p>
<p><strong>Instructor:</strong> ${instructor}</p>
<p><strong>Status:</strong> Pending Admin Approval</p>

</div>

${socialFooter}

</div>

<div style="background:#012169; padding:15px; text-align:center; color:white;">
X-Drive Driving School
</div>

</div>

</div>
`
});
};

/*
========================================
BOOKING APPROVED EMAIL
========================================
*/

export const sendApprovedBookingEmail = async (
 email,
 name,
 date,
 time,
 instructor
) => {

 try {

 console.log("Sending approval email to:", email);
 console.log("EMAIL_FROM:", process.env.EMAIL_FROM);
 console.log("Instructor:", instructor);

 // check resend
 if (!resend) {
 console.log("Resend is not initialized");
 return;
 }

 // validate required fields
 if (!email) {
 console.log("Student email missing");
 return;
 }

 const response = await resend.emails.send({
 from: process.env.EMAIL_FROM,
 to: email,
 subject: "Booking Approved - X-Drive Academy",
 html: `

<div style="font-family:Arial; background:#f4f6f8; padding:40px;">

<div style="max-width:600px; margin:auto; background:white; border-radius:8px;">

<div style="background:#012169; padding:20px; color:white; text-align:center;">
<h2>Booking Approved</h2>
</div>

<div style="padding:30px;">

<h3 style="color:#012169;">Hello ${name}</h3>

<p>Your driving lesson booking has been approved by admin.</p>

<div style="background:#f9f9f9; padding:20px; border-radius:5px;">

<p><strong>Date:</strong> ${date}</p>
<p><strong>Time:</strong> ${time}</p>
<p><strong>Instructor:</strong> ${instructor}</p>
<p><strong>Status:</strong> Approved</p>

</div>

<p style="margin-top:20px;">
Please arrive 10 minutes before your lesson time.
</p>

${socialFooter}

</div>

<div style="background:#012169; padding:15px; text-align:center; color:white;">
X-Drive Driving School © ${new Date().getFullYear()}
</div>

</div>

</div>
`
 });

 console.log("Resend response:", response);
 } catch (error) {

 console.error("Booking approval email error:", error.message);

 }
};