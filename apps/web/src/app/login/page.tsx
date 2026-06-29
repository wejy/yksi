'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Input, Card, CardContent } from '@yksi/ui'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegister, setIsRegister] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const endpoint = isRegister ? '/api/auth/sign-up/email' : '/api/auth/sign-in/email'

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name: email.split('@')[0] }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.message ?? 'Kirjautuminen epäonnistui')
      setLoading(false)
      return
    }

    router.push('/')
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-6 pt-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">Yksi</h1>
            <p className="text-sm text-on-surface-variant">
              Kaikki tehtävät yhteen näkymään
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              placeholder="Sähköposti"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Salasana"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && <p className="text-sm text-error">{error}</p>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? 'Odota...'
                : isRegister
                  ? 'Rekisteröidy'
                  : 'Kirjaudu sisään'}
            </Button>
          </form>

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
            onClick={() => {
              window.location.href = '/api/auth/sign-in/social?provider=google'
            }}
          >
            Jatka Googlella
          </Button>

          <p className="text-center text-sm text-on-surface-variant">
            {isRegister ? 'Onko sinulla jo tili?' : 'Eikö sinulla ole tiliä?'}{' '}
            <button
              type="button"
              onClick={() => setIsRegister(!isRegister)}
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
