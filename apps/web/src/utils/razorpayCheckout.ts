export type RazorpayCheckoutOrder = {
  keyId?: string;
  orderId: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill: {
    name: string | null;
    email: string | null;
  };
  themeColor?: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

let razorpayScriptPromise: Promise<void> | null = null;

export function ensureRazorpayCheckoutLoaded() {
  if (typeof window === 'undefined') return Promise.reject(new Error('Razorpay checkout is only available in the browser.'));
  if (window.Razorpay) return Promise.resolve();
  if (razorpayScriptPromise) return razorpayScriptPromise;

  razorpayScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-razorpay-checkout="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('Failed to load Razorpay checkout.')), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.dataset.razorpayCheckout = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay checkout.'));
    document.body.appendChild(script);
  });

  return razorpayScriptPromise;
}

export function openRazorpayCheckout(order: RazorpayCheckoutOrder) {
  return new Promise<{ orderId: string; paymentId: string; signature: string }>((resolve, reject) => {
    if (!window.Razorpay || !order.keyId) {
      reject(new Error('Razorpay key is missing from the API.'));
      return;
    }

    const razorpay = new window.Razorpay({
      key: order.keyId,
      order_id: order.orderId,
      amount: order.amount,
      currency: order.currency,
      name: order.name,
      description: order.description,
      prefill: {
        name: order.prefill.name ?? undefined,
        email: order.prefill.email ?? undefined,
      },
      handler: (response: Record<string, string>) => {
        resolve({
          orderId: response.razorpay_order_id,
          paymentId: response.razorpay_payment_id,
          signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: () => reject(new Error('Payment was cancelled.')),
      },
      theme: {
        color: order.themeColor ?? '#0ea5e9',
      },
    });

    razorpay.open();
  });
}