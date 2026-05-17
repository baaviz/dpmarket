import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Container } from '@/components/layout/container';
import { Section } from '@/components/layout/section';
import { ChevronDown } from 'lucide-react';

const FAQ_DATA = {
  ar: [
    { q: 'كيف أشتري كود التفعيل؟', a: 'اختر المنتج المطلوب، ادخل رقم جوالك، أكمل الدفع عبر بوابة MyFatoorah الآمنة، وسيصلك الكود فوراً.' },
    { q: 'هل أحتاج حساب للشراء؟', a: 'لا، يمكنك الشراء مباشرة برقم جوالك فقط. لا يلزم إنشاء حساب أو تسجيل دخول.' },
    { q: 'كيف أستلم الكود بعد الدفع؟', a: 'يظهر الكود فوراً على الشاشة بعد الدفع الناجح، ويتم إرساله أيضاً عبر واتساب إلى رقم جوالك.' },
    { q: 'ما هي طرق الدفع المتاحة؟', a: 'ندعم الدفع عبر K-NET، فيزا، ماستركارد، وأبل باي من خلال بوابة MyFatoorah الآمنة.' },
    { q: 'هل الشراء آمن؟', a: 'نعم، جميع المعاملات مشفرة بتقنية AES-256 وتتم عبر بوابة دفع معتمدة ومرخصة.' },
    { q: 'ماذا أفعل إذا لم أستلم الكود؟', a: 'تواصل مع فريق الدعم عبر واتساب وسنساعدك في أقرب وقت. احتفظ برقم الطلب للمراجعة.' },
  ],
  en: [
    { q: 'How do I buy an activation code?', a: 'Choose the product, enter your mobile number, complete the payment via MyFatoorah, and your code will be delivered instantly.' },
    { q: 'Do I need an account to buy?', a: 'No, you can buy directly with just your mobile number. No account or registration required.' },
    { q: 'How do I receive the code after payment?', a: 'The code appears instantly on screen after successful payment, and is also sent via WhatsApp to your mobile.' },
    { q: 'What payment methods are available?', a: 'We support K-NET, Visa, Mastercard, and Apple Pay through the secure MyFatoorah gateway.' },
    { q: 'Is the purchase secure?', a: 'Yes, all transactions are encrypted with AES-256 and processed through a licensed payment gateway.' },
    { q: 'What if I don\'t receive the code?', a: 'Contact our support team via WhatsApp and we\'ll assist you promptly. Keep your order number for reference.' },
  ],
};

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group border-b border-surface-100 last:border-b-0">
      <summary className="flex w-full cursor-pointer list-none items-center justify-between py-5 text-start group">
        <span className="text-sm font-medium text-surface-900 group-hover:text-primary-600 transition-colors pe-4">{question}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-surface-400 transition-transform duration-200 group-open:rotate-180" />
      </summary>
      <div className="pb-5">
        <p className="text-sm text-surface-500 leading-relaxed">{answer}</p>
      </div>
    </details>
  );
}

export async function FaqSection({ locale }: { locale: string }) {
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const faqs = FAQ_DATA[locale === 'ar' ? 'ar' : 'en'];

  return (
    <Section className="py-20 md:py-28">
      <Container>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{t('faq')}</h2>
            <p className="mt-3 text-surface-500">{t('faqDesc')}</p>
          </div>
          <div className="border border-surface-100 rounded-2xl px-6">
            {faqs.map((faq) => (
              <FaqItem key={faq.q} question={faq.q} answer={faq.a} />
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
