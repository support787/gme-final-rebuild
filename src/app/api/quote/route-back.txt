import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// This function handles POST requests to /api/quote
export async function POST(request) {
  try {
    const data = await request.json();
    const { fullName, company, email, country, message, productName } = data;

    // --- Validation ---
    if (!fullName || !email || !message) {
      return NextResponse.json({ message: 'Full Name, Email, and Message are required.' }, { status: 400 });
    }

    // --- Nodemailer Transport Setup ---
    // The transporter is the "mailman" that will send the email.
    // We are using environment variables for security.
    const transporter = nodemailer.createTransport({
      service: 'gmail', // You can use other services like SendGrid, etc.
      auth: {
        user: process.env.GMAIL_EMAIL, // Your Gmail address
        pass: process.env.GMAIL_APP_PASSWORD, // An "App Password" from your Google account
      },
    });

    // --- Email Content ---
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: process.env.GMAIL_EMAIL, // Sending the email to yourself
      subject: `Quote Request from ${fullName} for ${productName}`,
      html: `
        <h2>New Quote Request</h2>
        <p><strong>Product:</strong> ${productName}</p>
        <hr>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Company:</strong> ${company || 'Not provided'}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Country:</strong> ${country || 'Not provided'}</p>
        <hr>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    // --- Send the Email ---
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: 'Email sent successfully!' }, { status: 200 });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Failed to send email.' }, { status: 500 });
  }
}
