type Props = {
  formTitle: string | null;
  responseId: string | null;
  submittedAt: string | null;
  onBackHome: () => void;
  onSubmitAnother?: () => void;
};

export function SubmissionConfirmedPage({ formTitle, responseId, submittedAt, onBackHome, onSubmitAnother }: Props) {
  const title = formTitle?.trim() || 'FormVerse submission';
  const submittedLabel = submittedAt?.trim() || 'Just now';
  const responseLabel = responseId?.trim() || 'Saved successfully';

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, rgba(14,165,233,0.22), transparent 42%), linear-gradient(160deg, #050816 0%, #081225 58%, #03060f 100%)', color: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 20px', fontFamily: "'Rajdhani', sans-serif" }}>
      <div style={{ width: '100%', maxWidth: 620, background: 'linear-gradient(180deg, rgba(6,12,28,0.92), rgba(4,8,18,0.88))', border: '1px solid rgba(56,189,248,0.24)', borderRadius: 28, boxShadow: '0 28px 80px rgba(0,0,0,0.46), 0 0 56px rgba(14,165,233,0.14)', overflow: 'hidden' }}>
        <div style={{ padding: '34px 30px 22px', borderBottom: '1px solid rgba(56,189,248,0.14)', background: 'linear-gradient(135deg, rgba(14,165,233,0.14), rgba(59,130,246,0.06))' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'rgba(8,15,30,0.6)', border: '1px solid rgba(125,211,252,0.24)', borderRadius: 999, padding: '7px 12px', fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 800, color: '#7dd3fc', marginBottom: 18 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 12px rgba(34,197,94,0.75)' }} />
            Submission confirmed
          </div>
          <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 'clamp(24px, 5vw, 36px)', lineHeight: 1.1, color: '#f0f9ff', marginBottom: 12 }}>Your response is in.</div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: 'rgba(186,230,253,0.78)' }}>
            FormVerse recorded your response for <strong style={{ color: '#ffffff' }}>{title}</strong>. Keep the details below if you need to reference this submission later.
          </p>
        </div>

        <div style={{ padding: '28px 30px 32px' }}>
          <div style={{ display: 'grid', gap: 14, marginBottom: 28 }}>
            <div style={{ background: 'rgba(8,15,30,0.72)', border: '1px solid rgba(125,211,252,0.12)', borderRadius: 18, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(125,211,252,0.58)', marginBottom: 6 }}>Response ID</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fdff', wordBreak: 'break-word' }}>{responseLabel}</div>
            </div>
            <div style={{ background: 'rgba(8,15,30,0.72)', border: '1px solid rgba(125,211,252,0.12)', borderRadius: 18, padding: '16px 18px' }}>
              <div style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(125,211,252,0.58)', marginBottom: 6 }}>Submitted</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#f8fdff' }}>{submittedLabel}</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <button onClick={onBackHome} style={{ background: 'linear-gradient(135deg, #0ea5e9, #38bdf8)', border: 'none', borderRadius: 14, color: '#04111e', fontSize: 13, fontWeight: 900, padding: '14px 20px', cursor: 'pointer', letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif", boxShadow: '0 0 24px rgba(56,189,248,0.24)' }}>
              Back to Home
            </button>
            {onSubmitAnother && (
              <button onClick={onSubmitAnother} style={{ background: 'rgba(8,15,30,0.8)', border: '1px solid rgba(125,211,252,0.24)', borderRadius: 14, color: '#d9f3ff', fontSize: 13, fontWeight: 800, padding: '14px 20px', cursor: 'pointer', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Rajdhani', sans-serif" }}>
                Submit Another Response
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}