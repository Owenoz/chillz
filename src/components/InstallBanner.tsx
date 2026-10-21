import { X, Lightning, DownloadSimple } from '@phosphor-icons/react'
import { useInstallPrompt } from '../hooks/useInstallPrompt'

export default function InstallBanner() {
  const { canInstall, install, dismiss } = useInstallPrompt()

  if (!canInstall) return null

  return (
    <div
      className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 animate-in"
      style={{ animation: 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both' }}
    >
      <div
        className="relative overflow-hidden rounded-2xl border border-white/10 p-4 flex items-center gap-3"
        style={{
          background: 'linear-gradient(135deg, rgba(108,99,255,0.18) 0%, rgba(13,11,26,0.98) 100%)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 0 0 1px rgba(108,99,255,0.2), 0 24px 48px rgba(0,0,0,0.6)',
        }}
      >
        {/* Glow */}
        <div className="absolute top-0 left-0 w-32 h-32 opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at top left, #6c63ff, transparent 70%)' }} />

        {/* Icon */}
        <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center shrink-0"
          style={{ boxShadow: '0 0 20px rgba(108,99,255,0.4)' }}>
          <Lightning weight="fill" size={20} className="text-white" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-white leading-tight">Add Chillz to Home Screen</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Watch offline-ready, like a real app</p>
        </div>

        {/* Install button */}
        <button
          onClick={install}
          className="flex items-center gap-1.5 shrink-0 px-3 py-2 rounded-xl text-xs font-bold text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #6c63ff, #4f46e5)',
            boxShadow: '0 4px 12px rgba(108,99,255,0.4)',
          }}
        >
          <DownloadSimple weight="bold" size={13} />
          Install
        </button>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="absolute top-2 right-2 text-gray-600 hover:text-white transition-colors p-1"
          aria-label="Dismiss"
        >
          <X weight="bold" size={12} />
        </button>
      </div>
    </div>
  )
}
