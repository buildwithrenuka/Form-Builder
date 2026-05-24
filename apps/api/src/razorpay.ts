import { TRPCError } from '@trpc/server';
import { createHmac, timingSafeEqual } from 'node:crypto';
import type { Env } from './db';

function verifyHexSignature(actual: string, expected: string): boolean {
  if (actual.length !== expected.length) return false;

  return timingSafeEqual(Buffer.from(actual, 'hex'), Buffer.from(expected, 'hex'));
}

function buildRazorpayAuthHeader(env: Env): string {
  if (!env.RAZORPAY_KEY_ID || !env.RAZORPAY_KEY_SECRET) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Razorpay is not configured on the server.' });
  }

  return `Basic ${Buffer.from(`${env.RAZORPAY_KEY_ID}:${env.RAZORPAY_KEY_SECRET}`).toString('base64')}`;
}

export async function createRazorpayOrder(env: Env, options: { amount: number; currency: string; receipt: string; notes: Record<string, string> }) {
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      Authorization: buildRazorpayAuthHeader(env),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: options.amount,
      currency: options.currency,
      receipt: options.receipt,
      notes: options.notes,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new TRPCError({ code: 'BAD_GATEWAY', message: `Razorpay order creation failed: ${errorText || response.statusText}` });
  }

  return await response.json() as {
    id: string;
    amount: number;
    currency: string;
    status: string;
  };
}

export async function verifyRazorpayPayment(
  env: Env,
  payment: { orderId: string; paymentId: string; signature: string },
  expected: { amount: number; currency: string },
) {
  if (!env.RAZORPAY_KEY_SECRET) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Razorpay is not configured on the server.' });
  }

  const expectedSignature = createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${payment.orderId}|${payment.paymentId}`)
    .digest('hex');

  if (!verifyHexSignature(payment.signature, expectedSignature)) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Payment verification failed.' });
  }

  const response = await fetch(`https://api.razorpay.com/v1/payments/${payment.paymentId}`, {
    headers: {
      Authorization: buildRazorpayAuthHeader(env),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new TRPCError({ code: 'BAD_GATEWAY', message: `Unable to verify Razorpay payment: ${errorText || response.statusText}` });
  }

  const details = await response.json() as {
    id: string;
    order_id: string;
    amount: number;
    currency: string;
    status: string;
  };

  if (details.order_id !== payment.orderId) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Payment order mismatch.' });
  }

  if (details.amount !== expected.amount || details.currency.toUpperCase() !== expected.currency.toUpperCase()) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Payment amount mismatch.' });
  }

  if (!['authorized', 'captured'].includes(details.status)) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Payment has not been completed.' });
  }

  return details;
}