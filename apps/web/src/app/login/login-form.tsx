'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Card, CardContent } from '@yksi/ui'
import { authClient } from '@/lib/auth-client'
import { DEMO_USER } from '@/lib/demo-user'

type LoginFormProps = {
  nextPath: string
}

export default function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    authClient.getSession().then(({ data }) => {
      if (data?.session) router.replace(nextPath)
    })
  }, [router, nextPath])

  function fillDemoCredentials() {
    setEmail(DEMO_USER.email)
    setPassword(DEMO_USER.password)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = isRegister
        ? await authClient.signUp.email({
            email,
            password,
            name: email.split('@')[0] || 'Käyttäjä',
          })
        : await authClient.signIn.email({ email, password })

      if (result.error) {
        setError(result.error.message ?? 'Kirjautuminen epäonnistui')
        return
      }

      router.push(nextPath)
      router.refresh()
    } catch {
      setError('Yhteys epäonnistui. Varmista että dev-palvelin on käynnissä.')
    } finally {
      setLoading(false)
    }
  }

  const hasGoogleOAuth =
    process.env.NEXT_PUBLIC_GOOGLE_OAUTH_ENABLED === 'true'

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-outline-variant shadow-lg">
        <CardContent className="space-y-6 pt-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-on-primary">
              Y
            </div>
            <h1 className="text-2xl font-bold text-on-surface">Yksi</h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              Kaikki tehtävät yhteen näkymään
            </p>
          </div>

          <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-low px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">
              Demotili
            </p>
            <p className="mt-1 text-sm text-on-surface">
              {DEMO_USER.email} / {DEMO_USER.password}
            </p>
            <button
              type="button"
              onClick={fillDemoCredentials}
              className="mt-2 text-sm font-semibold text-primary hover:underline"
            >
              Täytä demotiedot
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-on-surface">
                Sähköposti
              </label>
              <Input
                id="email"
                type="email"
                placeholder="nimi@esimerkki.fi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-on-surface">
                Salasana
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                required
                minLength={8}
              />
            </div>

            {error && (
              <p className="rounded-lg bg-surface-container px-3 py-2 text-sm text-error">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? 'Odota...'
                : isRegister
                  ? 'Rekisteröidy'
                  : 'Kirjaudu sisään'}
            </Button>
          </form>

          {hasGoogleOAuth && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-outline-variant" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-surface-container-lowest px-2 text-on-surface-variant">
                    tai
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                type="button"
                onClick={() => {
                  window.location.href = '/api/auth/sign-in/social?provider=google'
                }}
              >
                Jatka Googlella
              </Button>
            </>
          )}

          <p className="text-center text-sm text-on-surface-variant">
            {isRegister ? 'Onko sinulla jo tili?' : 'Eikö sinulla ole tiliä?'}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
              }}
              className="font-medium text-primary hover:underline"
            >
              {isRegister ? 'Kirjaudu sisään' : 'Rekisteröidy'}
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
