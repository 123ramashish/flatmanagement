// app/api/auth/forgot-password/route.ts
// ─────────────────────────────────────
// ENV vars required in .env.local:
//   SMTP_HOST=smtp.gmail.com
//   SMTP_PORT=587
//   SMTP_USER=you@gmail.com
//   SMTP_PASS=your-app-password
//   SMTP_FROM=FlatWork <you@gmail.com>
//   NEXTAUTH_URL=http://localhost:3000
//
// Install dependency:  npm install nodemailer @types/nodemailer
// ─────────────────────────────────────

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Flat from '@/models/Flat';

// We store { email, token, expiresAt } in memory for simplicity.
// For production, persist this in a MongoDB collection instead.
export const resetTokenStore = new Map<string, { email: string; isFlat: boolean; expiresAt: number }>();

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalised = email.toLowerCase().trim();

    // Check if email belongs to a user or a flat admin
    const user = await User.findOne({ email: normalised });
    const flat = !user ? await Flat.findOne({ email: normalised }) : null;

    if (!user && !flat) {
      // Return generic success so we don't leak which emails exist
      return NextResponse.json({ success: true });
    }

    // Generate a secure random token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 1000 * 60 * 60; // 1 hour

    resetTokenStore.set(token, { email: normalised, isFlat: !!flat, expiresAt });

    // Build reset link
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    // Send email
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const name = user ? user.name : flat!.name;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: normalised,
      subject: 'FlatWork — Reset your password',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Reset Password</title>
        </head>
        <body style="margin:0;padding:0;background:#0f172a;font-family:'Segoe UI',sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="100%" style="max-width:480px;background:#1e293b;border-radius:16px;border:1px solid #334155;overflow:hidden;">
                  <!-- Header -->
                  <tr>
                    <td style="background:#166534;padding:28px 32px;text-align:center;">
                      <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:12px;padding:10px 20px;">
                        <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">🏠 FlatWork</span>
                      </div>
                    </td>
                  </tr>
                  <!-- Body -->
                  <tr>
                    <td style="padding:32px;">
                      <h1 style="color:#f1f5f9;font-size:22px;font-weight:700;margin:0 0 8px;">
                        Reset your password
                      </h1>
                      <p style="color:#94a3b8;font-size:14px;line-height:1.6;margin:0 0 24px;">
                        Hi <strong style="color:#e2e8f0;">${name}</strong>, we received a request to reset your FlatWork password.
                        Click the button below — this link expires in <strong style="color:#22c55e;">1 hour</strong>.
                      </p>

                      <div style="text-align:center;margin:28px 0;">
                        <a href="${resetLink}"
                           style="display:inline-block;background:#22c55e;color:#ffffff;text-decoration:none;
                                  font-weight:700;font-size:15px;padding:14px 32px;border-radius:12px;
                                  box-shadow:0 4px 14px rgba(34,197,94,0.35);">
                          Reset Password →
                        </a>
                      </div>

                      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0;">
                        If you didn't request this, you can safely ignore this email.
                        Your password won't change until you click the link above.
                      </p>
                    </td>
                  </tr>
                  <!-- Footer -->
                  <tr>
                    <td style="padding:16px 32px;border-top:1px solid #334155;background:#0f172a;">
                      <p style="color:#475569;font-size:11px;text-align:center;margin:0;">
                        FlatWork · Flat Work Management · Link expires in 1 hour
                      </p>
                      <p style="color:#334155;font-size:10px;text-align:center;margin:6px 0 0;word-break:break-all;">
                        ${resetLink}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('forgot-password error:', err);
    return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
  }
}