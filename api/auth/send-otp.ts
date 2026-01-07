import { createHash, createHmac } from 'node:crypto';

import { Resend } from 'resend';

const json = (res: any, status: number, body: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

const createOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const sha256Hex = (value: string) => createHash('sha256').update(value).digest('hex');

const sign = (value: string, secret: string) => createHmac('sha256', secret).update(value).digest('base64url');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return json(res, 405, { message: 'Method not allowed' });
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const otpSecret = process.env.OTP_SECRET;

  if (!resendApiKey || !otpSecret) {
    return json(res, 500, { message: 'Server is not configured' });
  }

  const body = req.body ?? {};
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!email) {
    return json(res, 400, { message: 'Email is required' });
  }

  const otp = createOtp();
  const exp = Date.now() + 10 * 60 * 1000;
  const otpHash = sha256Hex(`${email}.${otp}.${otpSecret}`);

  const payload = JSON.stringify({ email, exp, otpHash });
  const payloadB64 = Buffer.from(payload).toString('base64url');
  const signature = sign(payloadB64, otpSecret);
  const token = `${payloadB64}.${signature}`;

  const resend = new Resend(resendApiKey);

  const from = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
  const subject = process.env.RESEND_OTP_SUBJECT || 'Verify your email';

  try {
    await resend.emails.send({
      from,
      to: email,
      subject,
      html: `<p>Hi${name ? ` ${name}` : ''},</p><p>Your verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:4px">${otp}</p><p>This code expires in 10 minutes.</p>`,
    });

    return json(res, 200, { token });
  } catch {
    return json(res, 500, { message: 'Failed to send email' });
  }
}
