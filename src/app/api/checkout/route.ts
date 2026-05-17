import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { createPayment } from '@/lib/server/services/myfatoorah';
import { getOrCreateGuestSession } from '@/lib/server/services/guest/guest-session.service';
import { generateSecureToken, hashIp, hashToken, hashUserAgent } from '@/lib/server/encryption';
import { getLocalizedText } from '@/lib/commerce';

function normalizeQatarMobile(value: string) {
  const digits = value.replace(/\D/g, '');
  if (digits.startsWith('974') && digits.length === 11) return digits.slice(3);
  if (digits.length === 8) return digits;
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { productSlug?: string; mobile?: string; locale?: 'ar' | 'en' };
    const locale = body.locale === 'en' ? 'en' : 'ar';
    const mobile = normalizeQatarMobile(body.mobile || '');

    if (!body.productSlug || !mobile) {
      return NextResponse.json({ error: locale === 'ar' ? 'تأكد من رقم الجوال وحاول مرة ثانية.' : 'Check your mobile number and try again.' }, { status: 400 });
    }

    const supabase = createSupabaseAdminClient();
    const { data: product } = await supabase
      .from('products')
      .select('id, slug, name, price, currency, is_active')
      .eq('slug', body.productSlug)
      .eq('is_active', true)
      .single();

    if (!product) {
      return NextResponse.json({ error: locale === 'ar' ? 'المنتج غير متوفر حالياً.' : 'This product is currently unavailable.' }, { status: 404 });
    }

    const mobileE164 = `+974${mobile}`;
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const guestSession = await getOrCreateGuestSession({ ip, userAgent });

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .upsert({
        mobile_country_code: '+974',
        mobile_number: mobile,
        mobile_e164: mobileE164,
        last_seen_at: new Date().toISOString(),
      }, { onConflict: 'mobile_e164' })
      .select('id')
      .single();

    if (customerError || !customer) {
      return NextResponse.json({ error: locale === 'ar' ? 'تعذر بدء الطلب. حاول مرة ثانية.' : 'Could not start the order. Try again.' }, { status: 500 });
    }

    const accessToken = generateSecureToken(32);
    const amount = Number(product.price);
    const productName = getLocalizedText(product.name, locale, locale === 'ar' ? 'كود تفعيل دوحة بلس' : 'Doha Plus Activation Code');

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customer.id,
        guest_session_id: guestSession.sessionId,
        status: 'pending_payment',
        payment_status: 'initiated',
        subtotal_amount: amount,
        total_amount: amount,
        currency: product.currency || 'QAR',
        customer_mobile_e164: mobileE164,
        customer_ip_hash: hashIp(ip),
        customer_user_agent_hash: hashUserAgent(userAgent),
        customer_country: 'QA',
        access_token_hash: hashToken(accessToken),
      })
      .select('id, public_order_number')
      .single();

    if (orderError || !order) {
      return NextResponse.json({ error: locale === 'ar' ? 'تعذر إنشاء الطلب. حاول مرة ثانية.' : 'Could not create the order. Try again.' }, { status: 500 });
    }

    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        product_id: product.id,
        product_name_snapshot: product.name,
        unit_price: amount,
        quantity: 1,
        total_price: amount,
        fulfillment_status: 'pending',
      });

    if (itemError) {
      return NextResponse.json({ error: locale === 'ar' ? 'تعذر تجهيز الطلب. حاول مرة ثانية.' : 'Could not prepare the order. Try again.' }, { status: 500 });
    }

    const payment = await createPayment({
      orderId: order.id,
      orderNumber: order.public_order_number,
      amount,
      customerName: locale === 'ar' ? 'عميل دوحة بلس' : 'Doha Plus Customer',
      customerMobile: mobile,
      mobileCountryCode: '+974',
      locale,
      items: [{ name: productName, quantity: 1, unitPrice: amount }],
    });

    await supabase.from('payment_attempts').insert({
      order_id: order.id,
      provider: 'myfatoorah',
      status: 'initiated',
      provider_invoice_id: String(payment.invoiceId),
      provider_customer_reference: payment.customerReference,
    });

    return NextResponse.json({
      payment_url: payment.paymentUrl,
      order_number: order.public_order_number,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'تعذر بدء الدفع. حاول مرة ثانية أو تواصل معنا.' }, { status: 500 });
  }
}
