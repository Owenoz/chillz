import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Crown, ArrowLeft, SpinnerGap, CheckCircle,
  WarningCircle, DeviceMobile, Lightning, X,
} from '@phosphor-icons/react'
import { useAuth } from '../contexts/AuthContext'
import {
  PLANS, initiatePayment, checkPaymentStatus,
  formatUgandaPhone, detectNetwork,
} from '../lib/jjumapay'
import { supabase } from '../lib/supabase'

type Step = 'plan' | 'pay' | 'processing' | 'success' | 'failed'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { user, refreshPlan } = useAuth()

  const [step, setStep]             = useState<Step>('plan')
  const [selectedPlan, setSelectedPlan] = useState(PLANS[1]) // yearly default
  const [phone, setPhone]           = useState('')
  const [network, setNetwork]       = useState<'MTN' | 'AIRTEL'>('MTN')
  const [busy, setBusy]             = useState(false)
  const [error, setError]           = useState('')
  const [txId, setTxId]             = useState('')
  const [pollCount, setPollCount]   = useState(0)

  // Pre-select plan from URL param
  useEffect(() => {
    const planId = searchParams.get('plan')
    if (planId) {
      const found = PLANS.find(p => p.id === planId)
      if (found) setSelectedPlan(found)
    }
  }, [searchParams])

  // Auto-detect network when phone changes
  useEffect(() => {
    if (phone.length >= 7) setNetwork(detectNetwork(phone))
  }, [phone])

  // Poll payment status every 4 seconds while processing
  useEffect(() => {
    if (step !== 'processing' || !txId) return
    const interval = setInterval(async () => {
      setPollCount(c => c + 1)
      const result = await checkPaymentStatus(txId)
      if (result.status === 'success') {
        clearInterval(interval)
        await activatePremium()
        setStep('success')
      } else if (result.status === 'failed') {
        clearInterval(interval)
        setError('Payment was declined. Please try again.')
        setStep('failed')
      }
    }, 4000)

    // Timeout after 3 minutes
    const timeout = setTimeout(() => {
      clearInterval(interval)
      if (step === 'processing') {
        setError('Payment is taking too long. Check your phone and try again.')
        setStep('failed')
      }
    }, 180000)

    return () => { clearInterval(interval); clearTimeout(timeout) }
  }, [step, txId])

  const activatePremium = async () => {
    if (!user) return
    const expiresAt = selectedPlan.id === 'yearly'
      ? new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()

    await supabase.from('subscriptions').upsert({
      user_id: user.id,
      plan: selectedPlan.id,
      status: 'active',
      amount: selectedPlan.price,
      currency: 'UGX',
      transaction_id: txId,
      activated_at: new Date().toISOString(),
      expires_at: expiresAt,
    }, { onConflict: 'user_id' })

    await refreshPlan()
  }

  const handlePay = async () => {
    if (!user) { navigate('/profile'); return }
    setError('')
    const formatted = formatUgandaPhone(phone)
    if (formatted.length < 10) { setError('Enter a valid Ugandan phone number (e.g. 0771234567)'); return }

    setBusy(true)
    const ref = `CHZ-${user.id.slice(0, 8)}-${Date.now()}`
    const result = await initiatePayment({
      amount: selectedPlan.price,
      currency: 'UGX',
      phone: formatted,
      network,
      reference: ref,
      description: `Chillz ${selectedPlan.name} Premium`,
      callback_url: `${window.location.origin}/api/jjuma-webhook`,
      customer_name: user.user_metadata?.full_name || user.email || '',
      customer_email: user.email || '',
    })

    if (result.success) {
      setTxId(result.transaction_id || ref)
      setStep('processing')
    } else {
      setError(result.message || 'Payment initiation failed. Try again.')
    }
    setBusy(false)
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 px-5">
        <Crown weight="fill" size={40} className="text-accent" />
        <p className="text-white font-black text-lg">Sign in to upgrade</p>
        <button onClick={() => navigate('/profile')} className="btn-primary px-6 py-2.5 rounded-xl text-sm font-bold text-white">
          Sign In
        </button>
      </div>
    )
  }

  return (
    <div className="bg-mesh min-h-screen pb-24">

      {/* Header */}
      <div className="sticky top-0 z-10 px-5 py-4 flex items-center gap-3"
        style={{ background: 'rgba(10,10,15,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(45,38,69,0.5)' }}>
        <button onClick={() => step === 'pay' ? setStep('plan') : navigate('/profile')}
          className="w-9 h-9 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-muted hover:text-white transition-all">
          <ArrowLeft weight="bold" size={16} />
        </button>
        <div>
          <h1 className="text-base font-black text-white">Upgrade to Premium</h1>
          <p className="text-[11px] text-muted">Powered by JjumaPay · Mobile Money</p>
        </div>
        <div className="ml-auto">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <span className="text-[10px] font-black text-emerald-400">J</span>
          </div>
        </div>
      </div>

      <div className="max-w-sm mx-auto px-5 pt-6 space-y-5">

        {/* ── Step 1: Choose plan ── */}
        {step === 'plan' && (
          <>
            <div className="text-center mb-2">
              <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-glow-md"
                style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)' }}>
                <Crown weight="fill" size={28} className="text-white" />
              </div>
              <h2 className="text-2xl font-black text-white">Go Premium</h2>
              <p className="text-sm text-muted mt-1">Choose your plan and pay with Mobile Money</p>
            </div>

            <div className="space-y-3">
              {PLANS.map(plan => (
                <button key={plan.id} onClick={() => setSelectedPlan(plan)}
                  className="w-full text-left rounded-2xl p-4 transition-all relative overflow-hidden"
                  style={{
                    background: selectedPlan.id === plan.id
                      ? 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(91,33,182,0.15))'
                      : 'rgba(19,17,28,0.8)',
                    border: `2px solid ${selectedPlan.id === plan.id ? '#7C3AED' : 'rgba(45,38,69,0.6)'}`,
                    boxShadow: selectedPlan.id === plan.id ? '0 0 20px rgba(124,58,237,0.2)' : 'none',
                  }}>
                  {plan.highlight && (
                    <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                      style={{ background: 'linear-gradient(135deg,#F59E0B,#F97316)' }}>
                      {plan.badge}
                    </div>
                  )}
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 transition-all ${
                      selectedPlan.id === plan.id ? 'border-primary bg-primary' : 'border-muted'
                    }`}>
                      {selectedPlan.id === plan.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-1.5 mb-2">
                        <span className="text-xl font-black text-white">
                          UGX {plan.price.toLocaleString()}
                        </span>
                        <span className="text-sm text-muted">{plan.period}</span>
                      </div>
                      <p className="text-sm font-bold text-white mb-2">{plan.name} Plan</p>
                      <ul className="space-y-1">
                        {plan.features.map(f => (
                          <li key={f} className="flex items-center gap-2 text-[11px] text-muted">
                            <CheckCircle weight="fill" size={12} className="text-emerald-400 shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <button onClick={() => setStep('pay')}
              className="w-full py-4 rounded-2xl text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 8px 24px rgba(124,58,237,0.5)' }}>
              Continue → Pay UGX {selectedPlan.price.toLocaleString()}
            </button>
          </>
        )}

        {/* ── Step 2: Enter phone ── */}
        {step === 'pay' && (
          <>
            <div className="rounded-2xl p-4 flex items-center gap-3"
              style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)' }}>
              <Crown weight="fill" size={20} className="text-accent shrink-0" />
              <div>
                <p className="text-sm font-black text-white">{selectedPlan.name} Plan</p>
                <p className="text-xs text-muted">UGX {selectedPlan.price.toLocaleString()}{selectedPlan.period}</p>
              </div>
              <button onClick={() => setStep('plan')} className="ml-auto text-muted hover:text-white">
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                  Mobile Money Number
                </label>
                <div className="relative">
                  <DeviceMobile weight="duotone" size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
                  <input
                    type="tel"
                    placeholder="e.g. 0771234567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white placeholder-muted focus:outline-none"
                    style={{ background: 'rgba(10,10,15,0.8)', border: '1px solid rgba(45,38,69,0.8)' }}
                  />
                </div>
                <p className="text-[11px] text-muted mt-1.5">Enter your MTN or Airtel number</p>
              </div>

              {/* Network selector */}
              <div>
                <label className="text-xs font-bold text-muted uppercase tracking-wider mb-2 block">
                  Network (auto-detected)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['MTN', 'AIRTEL'] as const).map(n => (
                    <button key={n} onClick={() => setNetwork(n)}
                      className="py-3 rounded-2xl text-sm font-black transition-all"
                      style={{
                        background: network === n
                          ? n === 'MTN' ? 'rgba(234,179,8,0.2)' : 'rgba(220,38,38,0.2)'
                          : 'rgba(19,17,28,0.8)',
                        border: `2px solid ${network === n
                          ? n === 'MTN' ? 'rgba(234,179,8,0.6)' : 'rgba(220,38,38,0.5)'
                          : 'rgba(45,38,69,0.6)'}`,
                        color: network === n
                          ? n === 'MTN' ? '#EAB308' : '#EF4444'
                          : '#7C7A91',
                      }}>
                      {n === 'MTN' ? '🟡' : '🔴'} {n}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-3 py-2.5">
                  <WarningCircle weight="duotone" size={16} className="shrink-0" />
                  <p className="text-xs flex-1">{error}</p>
                  <button onClick={() => setError('')}><X size={12} /></button>
                </div>
              )}

              <button onClick={handlePay} disabled={busy || !phone}
                className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 8px 24px rgba(124,58,237,0.5)' }}>
                {busy
                  ? <><SpinnerGap weight="bold" size={18} className="animate-spin" /> Processing…</>
                  : <><Lightning weight="fill" size={16} /> Pay UGX {selectedPlan.price.toLocaleString()}</>
                }
              </button>

              <p className="text-[11px] text-muted text-center">
                You'll receive a prompt on your phone to confirm the payment.
                <br />Secured by JjumaPay · MTN &amp; Airtel Money
              </p>
            </div>
          </>
        )}

        {/* ── Step 3: Processing ── */}
        {step === 'processing' && (
          <div className="flex flex-col items-center text-center py-10 gap-5">
            <div className="relative">
              <div className="w-24 h-24 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(124,58,237,0.15)', border: '2px solid rgba(124,58,237,0.3)' }}>
                <SpinnerGap weight="bold" size={40} className="text-primary animate-spin" />
              </div>
              <div className="absolute inset-0 rounded-full animate-ping opacity-20"
                style={{ background: 'rgba(124,58,237,0.4)' }} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white mb-2">Check Your Phone</h2>
              <p className="text-sm text-muted max-w-xs">
                A payment prompt has been sent to <strong className="text-white">{phone}</strong>.
                Approve it on your {network} Mobile Money to complete.
              </p>
            </div>
            <div className="w-full rounded-2xl p-4 space-y-2"
              style={{ background: 'rgba(19,17,28,0.8)', border: '1px solid rgba(45,38,69,0.6)' }}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Amount</span>
                <span className="font-bold text-white">UGX {selectedPlan.price.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Network</span>
                <span className="font-bold text-white">{network} Mobile Money</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Plan</span>
                <span className="font-bold text-white">{selectedPlan.name} Premium</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted">Check {pollCount}</span>
                <span className="text-xs text-muted">Verifying…</span>
              </div>
            </div>
            <p className="text-[11px] text-muted">This page will update automatically once payment is confirmed.</p>
          </div>
        )}

        {/* ── Step 4: Success ── */}
        {step === 'success' && (
          <div className="flex flex-col items-center text-center py-10 gap-5">
            <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-glow-lg"
              style={{ background: 'linear-gradient(135deg,#10B981,#059669)' }}>
              <CheckCircle weight="fill" size={44} className="text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2">You're Premium! 🎉</h2>
              <p className="text-sm text-muted">
                Welcome to Chillz Premium. Enjoy HD streaming, ad-free experience, and unlimited downloads.
              </p>
            </div>
            <div className="w-full rounded-2xl p-4"
              style={{ background: 'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(19,17,28,0.8))', border: '1px solid rgba(16,185,129,0.3)' }}>
              <div className="flex items-center gap-3">
                <Crown weight="fill" size={24} className="text-accent shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-black text-white">{selectedPlan.name} Plan Active</p>
                  <p className="text-xs text-muted">
                    {selectedPlan.id === 'yearly' ? 'Valid for 1 year' : 'Valid for 30 days'}
                  </p>
                </div>
              </div>
            </div>
            <button onClick={() => navigate('/')}
              className="w-full py-4 rounded-2xl text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 8px 24px rgba(124,58,237,0.5)' }}>
              Start Watching →
            </button>
          </div>
        )}

        {/* ── Step 5: Failed ── */}
        {step === 'failed' && (
          <div className="flex flex-col items-center text-center py-10 gap-5">
            <div className="w-24 h-24 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid rgba(239,68,68,0.3)' }}>
              <WarningCircle weight="fill" size={44} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white mb-2">Payment Failed</h2>
              <p className="text-sm text-muted">{error || 'Something went wrong. Please try again.'}</p>
            </div>
            <button onClick={() => { setStep('pay'); setError('') }}
              className="w-full py-4 rounded-2xl text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg,#7C3AED,#5B21B6)', boxShadow: '0 8px 24px rgba(124,58,237,0.5)' }}>
              Try Again
            </button>
            <button onClick={() => navigate('/profile')} className="text-sm text-muted hover:text-white transition-colors">
              Go back to Profile
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
