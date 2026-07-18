// src/app/api/send-otp/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { email, otp } = await request.json();

    const emailPassword = process.env.HOSTINGER_EMAIL_PASSWORD;

    // Fail-safe check to ensure environment variables are readable
    if (!emailPassword) {
      console.error("CRITICAL ERROR: HOSTINGER_EMAIL_PASSWORD environment variable is missing or undefined.");
      return NextResponse.json({ 
        success: false, 
        error: "Server configuration issue: Mail credentials missing." 
      }, { status: 500 });
    }

    // 1. Establish robust transport layer to Hostinger's gateway
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: 'sales@nelcyraexports.com',
        pass: emailPassword, 
      },
      // Bypasses local strict network/certificate handshaking blocks
      tls: {
        rejectUnauthorized: false
      }
    });

    // 2. Format the layout of the automated security verification dispatch
    const mailOptions = {
      from: '"Nelcyra Exports Control Center" <sales@nelcyraexports.com>',
      to: email,
      subject: 'System Terminal Verification Code - Nelcyra Exports',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; color: #12331F; border: 1px solid #E2E8E4; padding: 24px; border-radius: 16px; background-color: #FAFAF5;">
          <h2 style="color: #12331F; border-bottom: 2px solid #038B45; padding-bottom: 10px; margin-top: 0; font-weight: normal;">Terminal Authentication</h2>
          <p style="font-size: 14px; color: #728178;">An administrative sign-in instance was registered for the main control console dashboard layout.</p>
          <div style="background-color: #F0F3F1; padding: 20px; border-radius: 12px; text-align: center; margin: 24px 0;">
            <span style="font-size: 28px; font-weight: bold; letter-spacing: 0.2em; color: #038B45;">${otp}</span>
          </div>
          <p style="font-size: 12px; color: #a0aba3;">This token layer is volatile and expires exactly 5 minutes from request timestamp.</p>
        </div>
      `,
    };

    // 3. Execute transmission payload delivery
    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Nodemailer SMTP Execution Failure:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}