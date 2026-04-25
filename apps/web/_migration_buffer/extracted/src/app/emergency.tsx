export default function Emergency() {
  return (
    <html>
      <body style={{ margin: 0, padding: '2rem', fontFamily: 'sans-serif', background: '#f3f4f6' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', background: 'white', padding: '2rem', borderRadius: '1rem', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h1 style={{ color: '#1f2937', marginBottom: '1rem' }}>🚨 Emergency Fallback</h1>
          <p style={{ color: '#6b7280' }}>This page loaded successfully without any framework dependencies.</p>
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#f9fafb', borderRadius: '0.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#374151', margin: 0 }}>
              ✅ Next.js server is running<br/>
              ✅ React is working<br/>
              ✅ Static HTML rendering works
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
