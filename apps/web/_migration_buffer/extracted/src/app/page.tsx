export default function HomePage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f3f4f6',
      fontFamily: 'system-ui, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
        padding: '48px',
        maxWidth: '600px',
        width: '100%'
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#111',
            marginBottom: '16px'
          }}>
            💰 Finance Tracker V3
          </h1>
          <p style={{
            fontSize: '20px',
            color: '#666',
            marginBottom: '32px'
          }}>
            Safe-to-Spend (S2S)
          </p>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              padding: '16px',
              background: '#eff6ff',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>✅</div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#1e40af' }}>Next.js 16</p>
            </div>
            <div style={{
              padding: '16px',
              background: '#f0fdf4',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>⚛️</div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#166534' }}>React 18</p>
            </div>
            <div style={{
              padding: '16px',
              background: '#faf5ff',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🎨</div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#7e22ce' }}>Tailwind v4</p>
            </div>
            <div style={{
              padding: '16px',
              background: '#fffbeb',
              borderRadius: '12px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
              <p style={{ fontSize: '14px', fontWeight: '600', color: '#b45309' }}>TypeScript</p>
            </div>
          </div>

          <div style={{
            padding: '16px',
            background: '#f9fafb',
            borderRadius: '12px',
            marginBottom: '32px'
          }}>
            <p style={{ fontSize: '14px', color: '#374151', margin: 0 }}>
              ✅ App rendered successfully!
            </p>
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '8px', margin: 0 }}>
              Route: / | Framework: Next.js App Router
            </p>
          </div>

          <a 
            href="/login" 
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              background: '#3b82f6',
              color: 'white',
              fontWeight: '600',
              borderRadius: '12px',
              textDecoration: 'none',
              transition: 'background 0.2s'
            }}
          >
            Đi tới Login →
          </a>
        </div>
      </div>
    </div>
  );
}
