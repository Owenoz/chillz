// JjumaPay Payment Integration
// Public Key:  bp_live_pub_284b44e293ce58ef696f7aba96216664f
// Secret Key:  bp_live_sec_c0e80f4bbe3c1f23f42f809f6f34f3b766371d5ce3f0d38e

export const JJUMA_PUBLIC_KEY = 'bp_live_pub_284b44e293ce58ef696f7aba96216664f'
export const JJUMA_SECRET_KEY = 'bp_live_sec_c0e80f4bbe3c1f23f42f809f6f34f3b766371d5ce3f0d38e'

// JjumaPay base API — standard Jjuma Global endpoint
export const JJUMA_BASE = 'https://api.jjuma.com/v1'

export interface PaymentRequest {
  amount: number
  currency: 'UGX'
  phone: string           // 256XXXXXXXXX format
  network: 'MTN' | 'AIRTEL'
  reference: string       // unique order id
  description: string
  callback_url: string    // webhook URL for confirmation
  customer_name: string
  customer_email: string
}

export interface PaymentResponse {
  success: boolean
  transaction_id?: string
  status?: 'pending' | 'success' | 'failed'
  message?: string
  checkout_url?: string  // redirect URL if applicable
}

// Initiate a mobile money payment collection
export async function initiatePayment(req: PaymentRequest): Promise<PaymentResponse> {
  try {
    const res = await fetch(`${JJUMA_BASE}/payments/collect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${JJUMA_SECRET_KEY}`,
        'X-Public-Key': JJUMA_PUBLIC_KEY,
      },
      body: JSON.stringify(req),
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      return { success: false, message: err?.message || `Payment error (${res.status})` }
    }

    const data = await res.json()
    return {
      success: true,
      transaction_id: data.transaction_id || data.id,
      status: data.status || 'pending',
      message: data.message,
      checkout_url: data.checkout_url,
    }
  } catch (e) {
    return { success: false, message: 'Network error. Please check your connection.' }
  }
}

// Check payment status by transaction ID
export async function checkPaymentStatus(transactionId: string): Promise<PaymentResponse> {
  try {
    const res = await fetch(`${JJUMA_BASE}/payments/${transactionId}`, {
      headers: {
        'Authorization': `Bearer ${JJUMA_SECRET_KEY}`,
        'X-Public-Key': JJUMA_PUBLIC_KEY,
      },
    })
    if (!res.ok) return { success: false, message: 'Could not verify payment status' }
    const data = await res.json()
    return {
      success: data.status === 'success',
      transaction_id: transactionId,
      status: data.status,
      message: data.message,
    }
  } catch {
    return { success: false, message: 'Network error verifying payment' }
  }
}

// Plans
export const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly',
    price: 5000,
    currency: 'UGX',
    period: '/month',
    features: [
      'HD streaming on all channels',
      'Ad-free experience',
      'Unlimited downloads',
      'Continue watching across devices',
      'Priority customer support',
    ],
    highlight: false,
  },
  {
    id: 'yearly',
    name: 'Yearly',
    price: 45000,
    currency: 'UGX',
    period: '/year',
    badge: 'Save 25%',
    features: [
      'Everything in Monthly',
      '4K Ultra HD where available',
      'Up to 5 devices simultaneously',
      'Early access to new features',
      'Dedicated support',
    ],
    highlight: true,
  },
]

// Format phone for JjumaPay (Uganda: 256XXXXXXXXX)
export function formatUgandaPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('256') && digits.length === 12) return digits
  if (digits.startsWith('0') && digits.length === 10) return '256' + digits.slice(1)
  if (digits.length === 9) return '256' + digits
  return digits
}

// Detect network from phone number
export function detectNetwork(phone: string): 'MTN' | 'AIRTEL' {
  const digits = formatUgandaPhone(phone)
  const prefix = digits.slice(3, 5) // after 256
  const mtn = ['77', '78', '76', '39']
  const airtel = ['70', '75', '74']
  if (mtn.some(p => prefix.startsWith(p))) return 'MTN'
  if (airtel.some(p => prefix.startsWith(p))) return 'AIRTEL'
  return 'MTN' // default
}
