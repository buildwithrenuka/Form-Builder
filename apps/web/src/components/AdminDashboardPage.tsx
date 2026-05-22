import { FormVerseLogo } from './Logo';
import { trpc } from '../trpc';

type Props = {
  onBack: () => void;
  onLogout: () => void;
};

const C = {
  bg: '#060014',
  purple: '#7c3aed',
  purpleL: '#a78bfa',
  cyan: '#00e5ff',
  gold: '#ffd700',
  green: '#22c55e',
};

export function AdminDashboardPage({ onBack, onLogout }: Props) {
  const { data, isLoading, error, refetch } = trpc.admin.overview.useQuery();

  return (
    <div style={{ position: 'fixed', inset: 0, background: C.bg, overflowY: 'auto', fontFamily: "'Rajdhani', sans-serif" }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: `linear-gradient(rgba(124,58,237,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.03) 1px, transparent 1px)`, backgroundSize: '72px 72px' }} />

      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(6,0,20,0.9)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(124,58,237,0.12)', padding: '0 32px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <FormVerseLogo size={28} textSize={11} />
          <div style={{ width: 1, height: 20, background: 'rgba(124,58,237,0.2)' }} />
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.gold, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Admin Dashboard</div>
            <div style={{ fontSize: 11, color: 'rgba(167,139,250,0.55)' }}>Platform totals and recent activity</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button onClick={onBack} style={{ background: 'transparent', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 8, color: C.purpleL, fontSize: 12, fontWeight: 600, padding: '7px 14px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}>← Back</button>
          <button onClick={onLogout} style={{ background: 'transparent', border: '1px solid rgba(255,100,100,0.3)', borderRadius: 8, color: 'rgba(255,120,120,0.7)', fontSize: 12, fontWeight: 600, padding: '7px 14px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}>Sign Out</button>
        </div>
      </nav>

      <div style={{ position: 'relative', zIndex: 1, maxWidth: 1100, margin: '0 auto', padding: '40px 24px 80px' }}>
        {isLoading && <div style={{ color: 'rgba(167,139,250,0.5)', fontSize: 14 }}>Loading admin overview...</div>}

        {!isLoading && error && (
          <div style={{ padding: '22px 24px', background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.22)', borderRadius: 14 }}>
            <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: '#fff', marginBottom: 6 }}>Admin access failed</div>
            <div style={{ fontSize: 13, color: 'rgba(255,190,190,0.8)', marginBottom: 14 }}>{error.message || 'You do not have access to admin data.'}</div>
            <button onClick={() => void refetch()} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 8, color: '#fff', fontSize: 12, fontWeight: 700, padding: '9px 14px', cursor: 'pointer', fontFamily: "'Rajdhani', sans-serif" }}>Retry</button>
          </div>
        )}

        {!isLoading && !error && data && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
              {[
                { icon: '👤', label: 'Users', value: data.totals.users, color: C.cyan },
                { icon: '🧾', label: 'Forms', value: data.totals.forms, color: C.purpleL },
                { icon: '📥', label: 'Responses', value: data.totals.responses, color: C.green },
                { icon: '🌐', label: 'Public Forms', value: data.totals.publicForms, color: C.gold },
                { icon: '🚀', label: 'Published', value: data.totals.publishedForms, color: '#f97316' },
              ].map((stat) => (
                <div key={stat.label} style={{ background: `${stat.color}08`, border: `1px solid ${stat.color}25`, borderRadius: 14, padding: '20px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{stat.icon}</div>
                  <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 22, fontWeight: 900, color: stat.color, marginBottom: 4 }}>{stat.value}</div>
                  <div style={{ fontSize: 11, color: 'rgba(167,139,250,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 18 }}>
              <section style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 22px' }}>
                <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: '#fff', marginBottom: 16 }}>Recent Users</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {data.recentUsers.map((user) => (
                    <div key={user.id} style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: 'rgba(167,139,250,0.6)' }}>{user.email}</div>
                      <div style={{ fontSize: 11, color: 'rgba(167,139,250,0.38)', marginTop: 4 }}>Joined {new Date(user.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </section>

              <section style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: '20px 22px' }}>
                <div style={{ fontFamily: "'Cinzel Decorative', serif", fontSize: 16, color: '#fff', marginBottom: 16 }}>Recent Forms</div>
                <div style={{ display: 'grid', gap: 10 }}>
                  {data.recentForms.map((form) => (
                    <div key={form.id} style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '12px 14px', background: 'rgba(255,255,255,0.02)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <div style={{ fontSize: 13, color: '#fff', fontWeight: 700 }}>{form.title}</div>
                        {form.archived && <span style={{ fontSize: 10, color: '#f97316', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 999, padding: '2px 8px' }}>ARCHIVED</span>}
                        {form.published && <span style={{ fontSize: 10, color: C.green, border: '1px solid rgba(34,197,94,0.3)', borderRadius: 999, padding: '2px 8px' }}>PUBLISHED</span>}
                        <span style={{ fontSize: 10, color: C.cyan, border: '1px solid rgba(0,229,255,0.25)', borderRadius: 999, padding: '2px 8px' }}>{form.visibility.toUpperCase()}</span>
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(167,139,250,0.6)' }}>{form.creatorName} · {form.creatorEmail}</div>
                      <div style={{ fontSize: 11, color: 'rgba(167,139,250,0.38)', marginTop: 4 }}>{form.slug} · {new Date(form.createdAt).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </>
        )}
      </div>
    </div>
  );
}