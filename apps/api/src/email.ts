// ── Email notifications via Resend ────────────────────────────────────────
// Guard with RESEND_API_KEY env var (optional – silently skips if not set)

interface Env {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  APP_BASE_URL?: string;
}

interface CreatorSubmissionAlertPayload {
  creatorEmail: string;
  formTitle: string;
  responseId: string;
  formId: string;
  submittedAt: string;
}

interface RespondentConfirmationPayload {
  respondentEmail: string;
  respondentName?: string | null;
  formTitle: string;
  responseId: string;
  submittedAt: string;
  formSlug?: string | null;
}

interface OutboundEmail {
  to: string[];
  subject: string;
  html: string;
}

function getAppBaseUrl(env: Env): string {
  return env.APP_BASE_URL?.trim() || 'https://formverse.app';
}

function getFromEmail(env: Env): string {
  return env.RESEND_FROM_EMAIL?.trim() || 'FormVerse <onboarding@resend.dev>';
}

function buildUrl(baseUrl: string, params?: Record<string, string | null | undefined>): string {
  const url = new URL(baseUrl);
  if (!params) return url.toString();

  for (const [key, value] of Object.entries(params)) {
    if (value) url.searchParams.set(key, value);
  }

  return url.toString();
}

async function sendEmail(env: Env, email: OutboundEmail): Promise<void> {
  if (!env.RESEND_API_KEY) return; // feature flag – skip if key not configured

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: getFromEmail(env),
        to: email.to,
        subject: email.subject,
        html: email.html,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error('Resend email send failed', {
        status: response.status,
        body,
        to: email.to,
        subject: email.subject,
      });
    }
  } catch {
    console.error('Resend email send threw before completion');
  }
}

export async function sendSubmissionAlert(env: Env, payload: CreatorSubmissionAlertPayload): Promise<void> {
  const dashboardUrl = getAppBaseUrl(env);

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
        <a href="${dashboardUrl}" style="background: linear-gradient(135deg, #5b21b6, #06b6d4); color: #fff; text-decoration: none; border-radius: 8px; padding: 11px 24px; font-size: 13px; font-weight: 700; letter-spacing: 0.08em;">View Dashboard →</a>
      </div>
      <p style="font-size: 11px; color: rgba(167,139,250,0.3); text-align: center; margin-top: 24px;">
        FormVerse · You are receiving this because you have email notifications enabled.
      </p>
    </div>
  `;

  await sendEmail(env, {
    to: [payload.creatorEmail],
    subject: `📥 New response to "${payload.formTitle}"`,
    html,
  });
}

export async function sendRespondentConfirmation(env: Env, payload: RespondentConfirmationPayload): Promise<void> {
  const greetingName = payload.respondentName?.trim();
  const heading = greetingName ? `Thanks, ${escapeHtml(greetingName)}.` : 'Thanks for your response.';
  const confirmationUrl = buildUrl(getAppBaseUrl(env), {
    confirmation: '1',
    formTitle: payload.formTitle,
    responseId: payload.responseId,
    submittedAt: payload.submittedAt,
    slug: payload.formSlug,
  });

  const html = `
    <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #070b1d; color: #d9e9ff; border-radius: 12px;">
      <div style="font-size: 32px; text-align: center; margin-bottom: 16px;">✅</div>
      <h1 style="font-size: 18px; color: #7dd3fc; margin: 0 0 8px; text-align: center;">${heading}</h1>
      <p style="font-size: 14px; color: rgba(186,230,253,0.78); text-align: center; margin: 0 0 24px; line-height: 1.6;">
        Your submission for <strong style="color: #ffffff;">${escapeHtml(payload.formTitle)}</strong> has been received.
      </p>
      <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
        <tr><td style="padding: 8px 12px; color: rgba(186,230,253,0.6); border-top: 1px solid rgba(14,165,233,0.14);">Response ID</td><td style="padding: 8px 12px; color: #fff; border-top: 1px solid rgba(14,165,233,0.14);">${escapeHtml(payload.responseId)}</td></tr>
        <tr><td style="padding: 8px 12px; color: rgba(186,230,253,0.6); border-top: 1px solid rgba(14,165,233,0.14);">Submitted</td><td style="padding: 8px 12px; color: #fff; border-top: 1px solid rgba(14,165,233,0.14);">${escapeHtml(payload.submittedAt)}</td></tr>
      </table>
      <div style="margin-top: 24px; text-align: center;">
        <a href="${confirmationUrl}" style="background: linear-gradient(135deg, #0ea5e9, #38bdf8); color: #04111e; text-decoration: none; border-radius: 8px; padding: 11px 24px; font-size: 13px; font-weight: 800; letter-spacing: 0.08em; display: inline-block;">View confirmation →</a>
      </div>
      <p style="font-size: 12px; color: rgba(186,230,253,0.55); text-align: center; margin: 24px 0 0; line-height: 1.6;">
        Keep this email for your records. If the form creator follows up, you can reference the response ID above.
      </p>
    </div>
  `;

  await sendEmail(env, {
    to: [payload.respondentEmail],
    subject: `✅ Submission received for "${payload.formTitle}"`,
    html,
  });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
