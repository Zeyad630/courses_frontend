import { createHash, createHmac } from 'node:crypto';

const json = (res: any, status: number, body: unknown) => {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
};

const sha256Hex = (value: string) => createHash('sha256').update(value).digest('hex');

const sign = (value: string, secret: string) => createHmac('sha256', secret).update(value).digest('base64url');

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return json(res, 405, { message: 'Method not allowed' });
  }

  const otpSecret = process.env.OTP_SECRET;

  if (!otpSecret) {
    return json(res, 500, { message: 'Server is not configured' });
  }

  const body = req.body ?? {};
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const otp = typeof body.otp === 'string' ? body.otp.trim() : '';
  const token = typeof body.token === 'string' ? body.token.trim() : '';

  if (!email || !otp || !token) {
    return json(res, 400, { message: 'Invalid request' });
  }

  const parts = token.split('.');
  if (parts.length !== 2) {
    return json(res, 400, { message: 'Invalid OTP' });
  }

  const [payloadB64, signature] = parts;
  const expectedSignature = sign(payloadB64, otpSecret);

  if (signature !== expectedSignature) {
    return json(res, 400, { message: 'Invalid OTP' });
  }

  let payloadRaw = '';
  try {
    payloadRaw = Buffer.from(payloadB64, 'base64url').toString('utf8');
  } catch {
    return json(res, 400, { message: 'Invalid OTP' });
  }

  let payload: { email: string; exp: number; otpHash: string };
  try {
    payload = JSON.parse(payloadRaw) as { email: string; exp: number; otpHash: string };
  } catch {
    return json(res, 400, { message: 'Invalid OTP' });
  }

  if (payload.email !== email) {
    return json(res, 400, { message: 'Invalid OTP' });
  }

  if (typeof payload.exp !== 'number' || payload.exp < Date.now()) {
    return json(res, 400, { message: 'OTP expired' });
  }

  const otpHash = sha256Hex(`${email}.${otp}.${otpSecret}`);

  if (otpHash !== payload.otpHash) {
    return json(res, 400, { message: 'Invalid OTP' });
  }

  return json(res, 200, { ok: true });
}
