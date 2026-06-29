'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, bottomNavPaddingClass, YksiLogoMark, IntegrationLogo } from '@yksi/ui'
import { INTEGRATION_CATALOG, formatSyncResult, formatSyncError, formatLastSyncedBadge, getProviderLabel } from '@yksi/core'
import { SyncOverlay } from '@/components/sync-overlay'
import { LocalizedBottomNav } from '@/components/localized-bottom-nav'
import { useI18n } from '@yksi/i18n/react'
import type { Locale } from '@yksi/i18n'

interface Connection {
  id: string
  provider: string
  status: string
  lastSyncedAt: string | null
}

interface User {
  email: string
  name: string | null
  image: string | null
  subscriptionTier: 'free' | 'premium'
}

const SETTINGS = [
  { icon: 'person', key: 'personalDetails' as const, href: '/profile/personal' },
  { icon: 'notifications_active', key: 'notifications' as const },
  { icon: 'palette', key: 'theme' as const, href: '/profile/theme' },
]

type ApiKeyProvider = 'linear' | 'notion'

const API_KEY_MODAL: Record<
  ApiKeyProvider,
  {
    title: string
    description: string
    linkHref: string
    linkLabel: string
    steps: string[]
    placeholder: string
    successMessage: string
  }
> = {
  linear: {
    title: 'Yhdistä Linear',
    description:
      'Luo henkilökohtainen API-avain Linearissa ja liitä se tähän. Ei vaadi palvelimen .env-asetuksia.',
    linkHref: 'https://linear.app/settings/api',
    linkLabel: 'Linear → Settings → API',
    steps: ['Luo uusi Personal API key', 'Liitä avain alle (alkaa yleensä lin_api_)'],
    placeholder: 'lin_api_...',
    successMessage: 'Linear yhdistetty onnistuneesti.',
  },
  notion: {
    title: 'Yhdistä Notion',
    description:
      'Luo sisäinen integraatio Notionissa ja liitä sen salainen avain tähän. Jaa tehtävä-tietokannat integraatiolle.',
    linkHref: 'https://www.notion.so/my-integrations',
    linkLabel: 'Notion → My integrations',
    steps: [
      'Luo uusi internal integration',
      'Kopioi Internal Integration Secret (secret_...)',
      'Notionissa: avaa tietokanta → ... → Connections → lisää integraatio',
    ],
    placeholder: 'secret_... tai ntn_...',
    successMessage: 'Notion yhdistetty onnistuneesti.',
  },
}

// Based on ui/profiili_ja_integraatiot/code.html
export default function ProfilePage() {
  return (
    <Suspense fallback={<ProfilePageFallback />}>
      <ProfilePageContent />
    </Suspense>
  )
}

function ProfilePageFallback() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <div className="mx-auto w-full max-w-lg flex-1 px-4 pb-24 pt-6">
        <div className="h-8 w-32 animate-pulse rounded bg-surface-container" />
      </div>
    </div>
  )
}

function ProfilePageContent() {
  const router = useRouter()
  const { t, locale } = useI18n()
  const searchParams = useSearchParams()
  const [user, setUser] = useState<User | null>(null)
  const [connections, setConnections] = useState<Connection[]>([])
  const [upgrading, setUpgrading] = useState(false)
  const [banner, setBanner] = useState<string | null>(null)
  const [oauthAvailable, setOauthAvailable] = useState<Record<string, boolean>>({})
  const [apiKeyModal, setApiKeyModal] = useState<ApiKeyProvider | null>(null)
  const [apiKeyValue, setApiKeyValue] = useState('')
  const [connectingApiKey, setConnectingApiKey] = useState(false)
  const [syncingProvider, setSyncingProvider] = useState<string | null>(null)
  const [syncOverlay, setSyncOverlay] = useState<{
    provider: string
    isFirstConnect: boolean
  } | null>(null)

  useEffect(() => {
    const error = searchParams.get('error')
    const connected = searchParams.get('connected')
    const created = searchParams.get('created')
    const updated = searchParams.get('updated')

    if (connected && created !== null && updated !== null) {
      setBanner(
        formatSyncResult(connected, {
          created: Number(created) || 0,
          updated: Number(updated) || 0,
        }),
      )
      router.replace('/profile', { scroll: false })
    } else if (connected) {
      setBanner(`${getProviderLabel(connected)} yhdistetty onnistuneesti.`)
      router.replace('/profile', { scroll: false })
    } else if (error === 'oauth_denied') {
      setBanner('Yhdistäminen peruutettiin.')
    } else if (error === 'oauth_failed') {
      setBanner('Yhdistäminen epäonnistui. Tarkista callback-URI Linear/Notion-konsolissa.')
    } else if (error === 'integration_not_configured') {
      setBanner('Integraatiota ei ole vielä konfiguroitu palvelimella.')
    }
  }, [searchParams, router])

  async function runSync(providerId: string, isFirstConnect = false) {
    setSyncOverlay({ provider: providerId, isFirstConnect })
    setSyncingProvider(providerId)
    setBanner(null)
    try {
      const res = await fetch(`/api/integrations/${providerId}/sync`, { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setBanner(formatSyncError(providerId, data.error ?? 'Synkka epäonnistui.'))
        return
      }
      setBanner(formatSyncResult(providerId, data))
      await refreshConnections()
    } finally {
      setSyncingProvider(null)
      setSyncOverlay(null)
    }
  }

  useEffect(() => {
    fetch('/api/user/me')
      .then((r) => r.json())
      .then(setUser)
      .catch(console.error)

    fetch('/api/integrations')
      .then((r) => r.json())
      .then((data) => {
        setConnections(data.connections ?? [])
        setOauthAvailable({
          linear: data.capabilities?.linear?.oauth ?? false,
          notion: data.capabilities?.notion?.oauth ?? false,
        })
      })
      .catch(console.error)
  }, [])

  async function refreshConnections() {
    const data = await fetch('/api/integrations').then((r) => r.json())
    setConnections(data.connections ?? [])
    setOauthAvailable({
      linear: data.capabilities?.linear?.oauth ?? false,
      notion: data.capabilities?.notion?.oauth ?? false,
    })
  }

  function openApiKeyModal(provider: ApiKeyProvider) {
    setApiKeyValue('')
    setApiKeyModal(provider)
  }

  function isConnected(provider: string) {
    return connections.some((c) => c.provider === provider && c.status === 'active')
  }

  function getConnection(provider: string) {
    return connections.find((c) => c.provider === provider && c.status === 'active')
  }

  async function handleUpgrade() {
    setUpgrading(true)
    const res = await fetch('/api/billing/checkout', { method: 'POST' })
    const data = await res.json()
    if (data.url) window.location.href = data.url
    setUpgrading(false)
  }

  async function handleConnect(providerId: string) {
    if (
      (providerId === 'linear' || providerId === 'notion') &&
      !oauthAvailable[providerId]
    ) {
      openApiKeyModal(providerId)
      return
    }

    const res = await fetch(`/api/integrations/${providerId}/connect`, {
      redirect: 'manual',
    })
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get('Location')
      if (location) window.location.href = location
      return
    }
    const data = await res.json().catch(() => ({}))
    if (data.code === 'LINEAR_USE_API_KEY') {
      openApiKeyModal('linear')
      return
    }
    if (data.code === 'NOTION_USE_API_KEY') {
      openApiKeyModal('notion')
      return
    }
    if (data.code === 'INTEGRATION_NOT_CONFIGURED') {
      setBanner(data.error)
      return
    }
    setBanner(data.error ?? 'Yhdistäminen epäonnistui.')
  }

  async function handleApiKeyConnect() {
    if (!apiKeyModal) return

    const provider = apiKeyModal
    setConnectingApiKey(true)
    setSyncOverlay({ provider, isFirstConnect: true })
    setBanner(null)
    try {
      const res = await fetch(`/api/integrations/${apiKeyModal}/api-key`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: apiKeyValue }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setBanner(data.error ?? 'API-avaimen yhdistäminen epäonnistui.')
        return
      }
      setApiKeyModal(null)
      setApiKeyValue('')
      if (provider === 'notion' && data.databaseCount === 0) {
        setBanner(
          'Notion yhdistetty, mutta tietokantoja ei löytynyt. Jaa tietokannat integraatiolle Notionissa ja synkkaa uudelleen.',
        )
      } else {
        setBanner(formatSyncResult(provider, data))
      }
      await refreshConnections()
    } finally {
      setConnectingApiKey(false)
      setSyncOverlay(null)
    }
  }

  async function handleSync(providerId: string) {
    await runSync(providerId, false)
  }

  return (
    <div className={`mx-auto min-h-screen max-w-2xl ${bottomNavPaddingClass}`}>
      <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-outline-variant bg-surface px-4">
        <div className="flex items-center gap-3">
          <YksiLogoMark />
          <h1 className="text-xl font-bold text-primary">{t('profile.title')}</h1>
        </div>
        <button
          type="button"
          className="rounded-full p-2 hover:bg-surface-container-low"
          aria-label={t('common.notifications')}
        >
          <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        </button>
      </header>

      <main className="space-y-8 px-4 pt-20">
        {banner ? (
          <div className="rounded-xl border border-outline-variant bg-surface-container-low px-4 py-3 text-sm text-on-surface">
            {banner}
          </div>
        ) : null}
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
            <h2 className="text-2xl font-semibold text-on-surface">{user.name ?? t('common.user')}</h2>
            <p className="text-on-surface-variant">{user.email}</p>
            <span className="mt-2 inline-block rounded-full bg-surface-container px-3 py-0.5 text-xs font-medium capitalize">
              {user.subscriptionTier === 'premium' ? t('profile.tierPremium') : t('profile.tierFree')}
            </span>
          </section>
        )}

        {user?.subscriptionTier === 'free' && (
          <section className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <h3 className="font-semibold">{t('profile.upgradeTitle')}</h3>
            <p className="mt-1 text-sm text-on-surface-variant">
              {t('profile.upgradeBody')}
            </p>
            <Button className="mt-3" onClick={handleUpgrade} disabled={upgrading}>
              {upgrading ? t('profile.upgradeLoading') : t('profile.upgradeCta')}
            </Button>
          </section>
        )}

        <section>
          <h3 className="mb-4 px-2 text-sm font-medium uppercase tracking-widest text-on-surface-variant">
            {t('profile.accountSettings')}
          </h3>
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest shadow-sm">
            {SETTINGS.map((item, i) => (
              <div key={item.key}>
                <button
                  type="button"
                  onClick={() => {
                    if (item.href) router.push(item.href)
                  }}
                  className="group flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-surface-container-low"
                >
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary">{item.icon}</span>
                    <span className="font-medium">{t(`profile.${item.key}`)}</span>
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
            {t('profile.integrations')}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {INTEGRATION_CATALOG.map((provider) => {
              const connected = isConnected(provider.id)
              const isAvailable = provider.availability === 'available'
              const connection = getConnection(provider.id)
              const lastSyncedLabel = formatLastSyncedBadge(
                connection?.lastSyncedAt,
                locale as Locale,
              )

              return (
                <div
                  key={provider.id}
                  className={`flex min-h-44 flex-col justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-sm transition-shadow hover:shadow-md ${!isAvailable ? 'opacity-80' : ''}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-outline-variant bg-surface p-2">
                      <IntegrationLogo
                        provider={provider.id}
                        size={22}
                        fallbackIcon={provider.icon}
                      />
                    </div>
                    {!isAvailable ? (
                      <span className="rounded-full bg-surface-container px-3 py-1 text-xs font-medium text-on-surface-variant">
                        {t('profile.comingSoon')}
                      </span>
                    ) : connected ? (
                      <span className="rounded-full border border-primary-container bg-surface-container-high px-2 py-1 text-xs font-medium text-primary">
                        {t('profile.connected')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleConnect(provider.id)}
                        className="rounded-full bg-secondary-container px-3 py-1 text-xs font-medium text-on-secondary-container transition-colors hover:bg-outline-variant"
                      >
                        {t('profile.connect')}
                      </button>
                    )}
                  </div>
                  <div>
                    <p className="font-bold">{provider.name}</p>
                    <p className="text-sm text-on-surface-variant">{provider.description}</p>
                    {connected && isAvailable ? (
                      <div className="mt-3 space-y-2">
                        <button
                          type="button"
                          onClick={() => handleSync(provider.id)}
                          disabled={syncingProvider === provider.id}
                          className="w-full rounded-full border border-primary bg-primary/5 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
                        >
                          {syncingProvider === provider.id ? t('profile.syncing') : t('profile.syncNow')}
                        </button>
                        {lastSyncedLabel ? (
                          <p className="text-center">
                            <span className="inline-flex rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-medium text-on-surface-variant">
                              {lastSyncedLabel}
                            </span>
                          </p>
                        ) : (
                          <p className="text-center">
                            <span className="inline-flex rounded-full bg-surface-container px-2 py-0.5 text-[10px] font-medium text-on-surface-variant">
                              {t('profile.notSyncedYet')}
                            </span>
                          </p>
                        )}
                      </div>
                    ) : null}
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
            {t('profile.signOut')}
          </button>
          <p className="mt-4 text-center text-sm text-outline">{t('profile.version')}</p>
        </section>
      </main>

      <LocalizedBottomNav activeTab="profile" />

      {syncOverlay ? (
        <SyncOverlay
          title={
            syncOverlay.isFirstConnect
              ? `Haetaan tehtäviä: ${getProviderLabel(syncOverlay.provider)}`
              : `Synkronoidaan: ${getProviderLabel(syncOverlay.provider)}`
          }
          description="Tämä voi kestää hetken, jos tehtäviä on paljon."
        />
      ) : null}

      {apiKeyModal && !syncOverlay ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-2xl border border-outline-variant bg-surface-container-lowest p-5 shadow-lg">
            <h3 className="text-lg font-bold text-on-surface">
              {API_KEY_MODAL[apiKeyModal].title}
            </h3>
            <p className="mt-2 text-sm text-on-surface-variant">
              {API_KEY_MODAL[apiKeyModal].description}
            </p>
            <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-on-surface-variant">
              <li>
                Avaa{' '}
                <a
                  href={API_KEY_MODAL[apiKeyModal].linkHref}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary underline"
                >
                  {API_KEY_MODAL[apiKeyModal].linkLabel}
                </a>
              </li>
              {API_KEY_MODAL[apiKeyModal].steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <input
              type="password"
              value={apiKeyValue}
              onChange={(e) => setApiKeyValue(e.target.value)}
              placeholder={API_KEY_MODAL[apiKeyModal].placeholder}
              className="mt-4 w-full rounded-lg border border-outline-variant px-3 py-2 text-sm"
              autoComplete="off"
            />
            <div className="mt-4 flex gap-2">
              <Button
                className="flex-1"
                onClick={handleApiKeyConnect}
                disabled={connectingApiKey || !apiKeyValue.trim()}
              >
                {connectingApiKey ? t('profile.syncing') : t('profile.connect')}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setApiKeyModal(null)
                  setApiKeyValue('')
                }}
              >
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
