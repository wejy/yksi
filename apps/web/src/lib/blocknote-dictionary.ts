import { en } from '@blocknote/core/locales'
import type { Dictionary } from '@blocknote/core/locales'
import type { Locale } from '@yksi/i18n'
import { fi } from './blocknote-fi'

const dictionaries: Record<Locale, Dictionary> = {
  fi,
  en,
}

export function getBlockNoteDictionary(locale: Locale): Dictionary {
  return dictionaries[locale] ?? en
}
