import { createAuthClient } from 'better-auth/react'

// Same origin as the page (dev server runs on port 3069).
export const authClient = createAuthClient()
