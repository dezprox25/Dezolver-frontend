import { useCallback } from 'react'
import { RAZORPAY_KEY } from '@/lib/constants'

/**
 * Razorpay Standard Checkout integration.
 *
 * Dynamically loads the Razorpay checkout script and opens the payment modal.
 * We never touch raw card numbers — PCI scope delegated entirely to Razorpay's iframe.
 *
 * IMPORTANT BACKEND LIMITATION:
 * handleSubscriptionCharged is a stub in the current backend. Subscriptions will NOT
 * automatically activate after payment. The checkout UI is complete but backend
 * activation requires the webhook handler to be implemented.
 */

interface RazorpayOptions {
  key: string
  amount?: number
  currency?: string
  name?: string
  description?: string
  order_id?: string
  subscription_id?: string
  prefill?: {
    name?: string
    email?: string
  }
  handler: (response: RazorpayResponse) => void
  modal?: {
    ondismiss?: () => void
  }
}

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id?: string
  razorpay_subscription_id?: string
  razorpay_signature: string
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => { open: () => void }
  }
}

const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js'

function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) { resolve(); return }
    const script = document.createElement('script')
    script.src = RAZORPAY_SCRIPT_URL
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay script'))
    document.body.appendChild(script)
  })
}

interface UseRazorpayCheckoutParams {
  orderId?: string
  subscriptionId?: string
  amountInr?: number
  description?: string
  prefillName?: string
  prefillEmail?: string
  onSuccess: (response: RazorpayResponse) => void
  onDismiss?: () => void
}

export function useRazorpayCheckout({
  orderId,
  subscriptionId,
  amountInr,
  description,
  prefillName,
  prefillEmail,
  onSuccess,
  onDismiss,
}: UseRazorpayCheckoutParams) {
  const openCheckout = useCallback(async () => {
    await loadRazorpayScript()

    if (!window.Razorpay) {
      throw new Error('Razorpay not loaded')
    }

    const options: RazorpayOptions = {
      key: RAZORPAY_KEY,
      currency: 'INR',
      name: 'Dezolver',
      description: description ?? 'Dezolver Subscription',
      handler: onSuccess,
      modal: { ondismiss: onDismiss },
      ...(orderId ? { order_id: orderId } : {}),
      ...(subscriptionId ? { subscription_id: subscriptionId } : {}),
      ...(amountInr ? { amount: amountInr * 100 } : {}),
      prefill: {
        name: prefillName,
        email: prefillEmail,
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  }, [orderId, subscriptionId, amountInr, description, prefillName, prefillEmail, onSuccess, onDismiss])

  return { openCheckout }
}
