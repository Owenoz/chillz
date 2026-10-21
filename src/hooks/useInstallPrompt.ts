import { useState, useEffect } from 'react'

// Typed interface for the browser install prompt event
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
  prompt(): Promise<void>
}

export function useInstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Already installed (running as standalone PWA)
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // User previously dismissed the banner
    const dismissed = localStorage.getItem('chillz-pwa-dismissed')
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Track when actually installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setPromptEvent(null)
    })

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (!promptEvent) return
    await promptEvent.prompt()
    const result = await promptEvent.userChoice
    if (result.outcome === 'accepted') {
      setIsInstalled(true)
    }
    setPromptEvent(null)
  }

  const dismiss = () => {
    localStorage.setItem('chillz-pwa-dismissed', '1')
    setIsDismissed(true)
    setPromptEvent(null)
  }

  return {
    canInstall: !!promptEvent && !isInstalled && !isDismissed,
    isInstalled,
    install,
    dismiss,
  }
}
