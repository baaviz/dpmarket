import Link from 'next/link';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <Section>
      <Container size="sm">
        <div className="flex flex-col items-center text-center py-16">
          <div className="mb-6 text-7xl font-bold gradient-text">404</div>
          <h1 className="text-2xl font-bold mb-3">الصفحة غير موجودة</h1>
          <p className="text-surface-500 mb-8">
            لم نتمكن من العثور على الصفحة المطلوبة
          </p>
          <Link href="/ar">
            <Button size="lg">العودة للرئيسية</Button>
          </Link>
        </div>
      </Container>
    </Section>
  );
}
