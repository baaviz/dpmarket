import Link from 'next/link';

export default function GlobalNotFound() {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' }}>
          <h1 style={{ fontSize: '4rem', fontWeight: 'bold', color: '#7e3bed', margin: 0 }}>404</h1>
          <p style={{ fontSize: '1.25rem', color: '#71717a', marginTop: '1rem' }}>الصفحة غير موجودة</p>
          <Link href="/ar" style={{ marginTop: '2rem', padding: '0.75rem 2rem', backgroundColor: '#7e3bed', color: 'white', borderRadius: '0.75rem', textDecoration: 'none', fontWeight: 600 }}>
            العودة للرئيسية
          </Link>
        </div>
      </body>
    </html>
  );
}
