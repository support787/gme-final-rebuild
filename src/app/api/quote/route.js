import { NextResponse } from 'next/server';

// This is a temporary diagnostic endpoint.
export async function POST(request) {
  // We will check the environment variables as seen by the live server.
  const emailVar = process.env.GMAIL_EMAIL;
  const passwordVar = process.env.GMAIL_APP_PASSWORD;

  console.log("GMAIL_EMAIL on server:", emailVar);
  console.log("GMAIL_APP_PASSWORD on server:", passwordVar);

  // We send a success response containing what we found.
  return NextResponse.json({
    message: "This is a diagnostic response from the server.",
    GMAIL_EMAIL_is_set: !!emailVar, // Will be true if the variable exists
    GMAIL_APP_PASSWORD_is_set: !!passwordVar, // Will be true if the variable exists
  }, { status: 200 });
}
