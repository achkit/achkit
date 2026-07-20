// Transactional mail via the box's local Postfix (127.0.0.1:25). Same MTA that
// already delivers hello@achkit.com; no external mail provider.
import nodemailer from 'nodemailer'

let tx: nodemailer.Transporter | null = null
function transport() {
  if (!tx) tx = nodemailer.createTransport({ host: '127.0.0.1', port: 25, secure: false, tls: { rejectUnauthorized: false } })
  return tx
}

export async function sendMail(to: string, subject: string, html: string): Promise<void> {
  await transport()
    .sendMail({ from: 'achkit <hello@achkit.com>', to, subject, html })
    .catch((e) => console.error('[mail] send failed', e?.message))
}
