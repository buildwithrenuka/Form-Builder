// ── Email notifications via Resend ────────────────────────────────────────
// Guard with RESEND_API_KEY env var (optional – silently skips if not set)

interface Env {
  RESEND_API_KEY?: string;
}

interface EmailPayload {
  creatorEmail: string;
  formTitle: string;
  responseId: string;
  formId: string;
  submittedAt: string;
}

export async function sendSubmissionAlert(env: Env, payload: EmailPayload): Promise<void> {
  if (!env.RESEND_API_KEY) return; // feature flag – skip if key not configured

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #060014; color: #e2d9ff; border-radius: 12px;">
      <div style="font-size: 32px; text-align: center; margin-bottom: 16px;">📥</div>
      <h1 style="font-size: 18px; color: #a78bfa; margin: 0 0 8px; text-align: center;">New Form Response</h1>
      <p style="font-size: 14px; color: rgba(167,139,250,0.7); text-align: center; margin: 0 0 24px;">
        Someone just submitted a response to <strong style="color: #fff;">${escapeHtml(payload.formTitle)}</strong>
      </p>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr><td style="padding: 8px 12px; color: rgba(167,139,250,0.5); border-top: 1px solid rgba(124,58,237,0.15);">Response ID</td><td style="padding: 8px 12px; color: #fff; border-top: 1px solid rgba(124,58,237,0.15);">${escapeHtml(payload.responseId)}</td></tr>
        <tr><td style="padding: 8px 12px; color: rgba(167,139,250,0.5); border-top: 1px solid rgba(124,58,237,0.15);">Submitted</td><td style="padding: 8px 12px; color: #fff; border-top: 1px solid rgba(124,58,237,0.15);">${escapeHtml(payload.submittedAt)}</td></tr>
      </table>
      <div style="margin-top: 24px; text-align: center;">
        <a href="https://formverse.app" style="background: linear-gradient(135deg, #5b21b6, #06b6d4); color: #fff; text-decoration: none; border-radius: 8px; padding: 11px 24px; font-size: 13px; font-weight: 700; letter-spacing: 0.08em;">View Dashboard →</a>
      </div>
      <p style="font-size: 11px; color: rgba(167,139,250,0.3); text-align: center; margin-top: 24px;">
        FormVerse · You are receiving this because you have email notifications enabled.
      </p>
    </div>
  `;

  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FormVerse <notifications@formverse.app>',
        to: [payload.creatorEmail],
        subject: `📥 New response to "${payload.formTitle}"`,
        html,
      }),
    });
    // Best-effort: don't throw on email failure
  } catch {
    // Silently ignore email errors – response was already saved
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
