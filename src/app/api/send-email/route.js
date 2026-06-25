// src/app/api/send-email/route.js
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { name, city, email, phone, message } = await request.json();

    if (!name || !city || !email || !phone || !message) {
      return NextResponse.json({ error: "Missing required form fields." }, { status: 400 });
    }

    // 1. Core Transporter Config
    // NOTE: If 'smtp.hostinger.com' continues to reset, change this host string to 'smtp.titan.email'
    const transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com', 
      port: 465,                  // Secure SSL Port
      secure: true,               // True for port 465
      logger: true,               // Force protocol logs directly into your VS Code terminal
      debug: true,                // Print full handshake data logs to find network drops
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false // Prevents local Windows network profile rejections
      }
    });

    // 2. Format Inbound Message Manifest
    const mailOptions = {
      from: `"${name}" <${process.env.SMTP_USER}>`, // Explicitly anchors authenticated sender domain
      to: 'sales@nelcyraexports.com',
      replyTo: email, 
      subject: `📦 NEW B2B RAW LEAD: ${name} (${city})`,
      text: `Name: ${name}\nCity: ${city}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${message}`,
      html: `
        <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #eaeaea; border-radius: 12px; background-color: #fafaf5;">
          <h2 style="color: #038B45; font-size: 20px; border-bottom: 2px solid #038B45; padding-bottom: 10px; margin-top: 0;">📦 New Procurement Inquiry — Nelcyra Exports</h2>
          <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
            <tr><td style="padding: 10px 0; font-weight: bold; color: #333; width: 30%;">Client Name:</td><td style="padding: 10px 0; color: #555;">${name}</td></tr>
            <tr><td style="padding: 10px 0; font-weight: bold; color: #333;">City / Country:</td><td style="padding: 10px 0; color: #555;">${city}</td></tr>
            <tr><td style="padding: 10px 0; font-weight: bold; color: #333;">Business Email:</td><td style="padding: 10px 0; color: #555;"><a href="mailto:${email}" style="color: #038B45; text-decoration: none;">${email}</a></td></tr>
            <tr><td style="padding: 10px 0; font-weight: bold; color: #333;">Contact Number:</td><td style="padding: 10px 0; color: #555;"><a href="tel:${phone}" style="color: #555; text-decoration: none;">${phone}</a></td></tr>
          </table>
          <div style="margin-top: 30px; padding: 20px; background-color: #ffffff; border-left: 4px solid #038B45; border-radius: 4px;">
            <h4 style="margin: 0 0 10px 0; color: #038B45;">Commodity Specification Manifest Request:</h4>
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #4a5043; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Detailed SMTP Server Connection Error Context: ", error);
    return NextResponse.json({ error: error.message || "Failed to transmit email." }, { status: 500 });
  }
}