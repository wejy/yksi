'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { BottomNav, Button } from '@yksi/ui'
import { INTEGRATION_CATALOG } from '@yksi/core'

interface Connection {
  id: string
  provider: string
  status: string
}

interface User {
  email: string
  name: string | null
  image: string | null
  subscriptionTier: 'free' | 'premium'
}

const SETTINGS = [
  { icon: 'person', label: 'Henkilötiedot' },
  { icon: 'notifications_active', label: 'Ilmoitukset' },
  { icon: 'palette', label: 'Teema' },
]

// Based on ui/profiili_ja_integraatiot/code.html
export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => r.json())
      .then(setUser)
      .catch(console.error)

    fetch('/api/integrations')
      .then((r) => r.json())
      .then((data) => setConnections(data.connections ?? []))
      .catch(console.error)
  }, [])

  function isConnected(provider: string) {
    return connections.some((c) => c.provider === provider && c.status === 'active')
  }

  async function handleUpgrade() {
    setUpgrading(true)
    const res = await fetch('/api/billing/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setUpgrading(false)
  }

  async function handleConnect(providerId: string) {
    window.location.href = `/api/integrations/${providerId}/connect`
  }

  async function handleSync(providerId: string) {
    await fetch(`/api/integrations/${providerId}/sync`, { method: 'POST' })
  }

  return (
    <div className="mx-auto min-h-screen max-w-2xl pb-20">
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-on-primary">
            Y
          </div>
          <h1 className="text-xl font-bold text-primary">Profiili</h1>
        </div>
        <button
          type="button"
          className="rounded-full p-2 hover:bg-surface-container-low"
          aria-label="Ilmoitukset"
        >
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        </button>
      </header>

      <main className="space-y-8 px-4 pb-12 pt-20">
        {user && (
          <section className="flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-surface-container-lowest shadow-sm">
                {user.image ? (
                  <img src={user.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-primary-container text-3xl font-bold text-on-primary-container">
                    {(user.name ?? user.email)[0]?.toUpperCase()}
                  </div>
                )}
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-on-surface">{user.name ?? 'Käyttäjä'}</h2>
            <p className="text-on-surface-variant">{user.email}</p>
            <span className="mt-2 inline-block rounded-full bg-surface-container px-3 py-0.5 text-xs font-medium capitalize">
              {user.subscriptionTier === 'premium' ? 'Premium' : 'Ilmainen'}
            </span>
          </section>
        )}

        {user?.subscriptionTier === 'free' && (
          <section className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <h3 className="font-semibold">Avaa rajattomat integraatiot</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              Premium sisältää rajattomat integraatiot ja kehittyneet filtterit.
            </p>
            <Button className="mt-3" onClick={handleUpgrade} disabled={upgrading}>
              {upgrading ? 'Ladataan...' : 'Päivitä Premiumiin — 9 €/kk'}
            </Button>
          </section>
        )}

        <section>
          <h3 className="mb-4 px-2 text-sm font-medium uppercase tracking-widest text-on-surface-variant">
            Tilin asetukset
          </h3>
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            {SETTINGS.map((item, i) => (
              <div key={item.label}>
                <button
                  type="button"
                  className="group flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-surface-container-low"
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <span className="material-symbols-outlined text-outline transition-transform group-hover:translate-x-1">
                    chevron_right
                  </span>
                </button>
                {i < SETTINGS.length - 1 && <div className="mx-4 h-px bg-outline-variant" />}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h3 className="mb-4 px-2 text-sm font-medium uppercase tracking-widest text-on-surface-variant">
            Integraatiot
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {INTEGRATION_CATALOG.map((provider) => {
              const connected = isConnected(provider.id)
              const isAvailable = provider.availability === 'available'

              return (
                <div
                  key={provider.id}
                  className={`flex h-40 flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-shadow hover:shadow-md ${!isAvailable ? 'opacity-80' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg border border-outline-variant bg-surface p-2">
                      <span
                        className={`material-symbols-outlined ${connected ? 'text-primary' : 'text-on-surface-variant'}`}
                        style={connected ? { fontVariationSettings: "'FILL' 1" } : undefined}
                      >
                        {provider.icon}
                      </span>
                    </div>
                    {!isAvailable ? (
                      <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-on-surface-variant">
                        Tulossa
                      </span>
                    ) : connected ? (
                      <button
                        type="button"
                        onClick={() => handleSync(provider.id)}
                        className="rounded-full border border-primary-container bg-surface-container-high px-2 py-1 text-xs font-medium text-primary"
                      >
                        Yhdistetty
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConnect(provider.id)}
                        className="rounded-full bg-secondary-container px-3 py-1 text-xs font-medium text-on-secondary-container transition-colors hover:bg-outline-variant"
                      >
                        Yhdistä
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="font-bold">{provider.name}</p>
                    <p className="text-sm text-on-surface-variant">{provider.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <button
            type="button"
            onClick={() => {
              window.location.href = '/api/auth/sign-out'
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-error-container py-4 font-semibold text-on-error-container transition-all hover:bg-error hover:text-on-error active:scale-95"
          >
            <span className="material-symbols-outlined">logout</span>
            Kirjaudu ulos
          </button>
          <p className="mt-4 text-center text-sm text-outline">Versio 1.0.0 (MVP)</p>
        </section>
      </main>

      <BottomNav
        activeTab="profile"
        onTabChange={(tab) => {
          const routes: Record<string, string> = {
            dashboard: '/',
            tasks: '/tasks',
            calendar: '/calendar',
            profile: '/profile',
          }
          router.push(routes[tab] ?? '/')
        }}
      />
    </div>
  )
}
