import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// This function handles POST requests to /api/contact
export async function POST(request) {
  try {
    const data = await request.json();
    const { name, email, subject, message } = data;

    // --- Validation ---
    if (!name || !email || !message) {
      return NextResponse.json({ message: 'Name, Email, and Message are required.' }, { status: 400 });
    }

    // --- Nodemailer Transport Setup ---
    // This uses the same credentials from your .env.local file
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // --- Email Content ---
    const mailOptions = {
      from: process.env.GMAIL_EMAIL,
      to: process.env.GMAIL_EMAIL, // Sending the email to yourself
      subject: `Contact Form Submission from ${name}: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject || 'Not provided'}</p>
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
