import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const TAG_LENGTH = 16
const KEY_LENGTH = 32

function getKeyFromHex(secret: string): Buffer | null {
  const key = Buffer.from(secret, 'hex')
  if (key.length !== KEY_LENGTH) return null
  return key
}

function getLegacyKey(secret: string): Buffer {
  return scryptSync(secret, 'yksi-salt', KEY_LENGTH)
}

function resolveEncryptionKey(secret: string): Buffer {
  const hexKey = getKeyFromHex(secret)
  if (hexKey) return hexKey
  return getLegacyKey(secret)
}

function getEncryptionSecret(): string {
  const secret = process.env.INTEGRATION_TOKEN_ENCRYPTION_KEY?.trim()
  if (!secret) {
    throw new Error('INTEGRATION_TOKEN_ENCRYPTION_KEY is not set')
  }
  return secret
}

export function encryptToken(plaintext: string): string {
  const key = resolveEncryptionKey(getEncryptionSecret())
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export function decryptToken(ciphertext: string): string {
  const secret = getEncryptionSecret()
  const data = Buffer.from(ciphertext, 'base64')
  const iv = data.subarray(0, IV_LENGTH)
  const tag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const encrypted = data.subarray(IV_LENGTH + TAG_LENGTH)

  const keys = [resolveEncryptionKey(secret)]
  const hexKey = getKeyFromHex(secret)
  if (hexKey) {
    keys.push(getLegacyKey(secret))
  }

  let lastError: unknown
  for (const key of keys) {
    try {
      const decipher = createDecipheriv(ALGORITHM, key, iv)
      decipher.setAuthTag(tag)
      return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8')
    } catch (error) {
      lastError = error
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to decrypt token')
}
