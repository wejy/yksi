import { IntegrationError } from '../errors'

export interface LinearGraphqlError {
  message?: string
  extensions?: {
    code?: string
    type?: string
    userPresentableMessage?: string
  }
}

export function mapLinearHttpError(status: number): IntegrationError {
  switch (status) {
    case 401:
      return new IntegrationError(
        'LINEAR_UNAUTHORIZED',
        'Linear-yhteys on vanhentunut tai API-avain on virheellinen. Yhdistä Linear uudelleen profiilissa.',
        401,
      )
    case 403:
      return new IntegrationError(
        'LINEAR_FORBIDDEN',
        'Linear ei salli tätä toimintoa. Tarkista integraation oikeudet (read/write).',
        403,
      )
    case 429:
      return new IntegrationError(
        'LINEAR_RATE_LIMITED',
        'Linearin rajaa ylitettiin. Odota hetki ja yritä synkkaa uudelleen.',
        429,
      )
    case 500:
    case 502:
    case 503:
    case 504:
      return new IntegrationError(
        'LINEAR_UNAVAILABLE',
        'Linear-palvelu ei vastaa juuri nyt. Yritä myöhemmin uudelleen.',
        502,
      )
    default:
      return new IntegrationError(
        'LINEAR_HTTP_ERROR',
        `Linear-palvelu palautti virheen (${status}). Yritä myöhemmin uudelleen.`,
        status >= 400 && status < 600 ? status : 502,
      )
  }
}

export function mapLinearGraphqlErrors(errors: LinearGraphqlError[]): IntegrationError {
  const first = errors[0]
  const message = first?.message?.toLowerCase() ?? ''
  const code = first?.extensions?.code?.toUpperCase() ?? ''
  const type = first?.extensions?.type?.toLowerCase() ?? ''

  if (
    code.includes('AUTH') ||
    type.includes('authentication') ||
    message.includes('not authenticated') ||
    message.includes('authentication required') ||
    message.includes('invalid token') ||
    message.includes('unauthorized')
  ) {
    return new IntegrationError(
      'LINEAR_UNAUTHORIZED',
      'Linear-yhteys on vanhentunut tai API-avain on virheellinen. Yhdistä Linear uudelleen profiilissa.',
      401,
    )
  }

  if (
    code.includes('FORBIDDEN') ||
    type.includes('forbidden') ||
    message.includes('forbidden') ||
    message.includes('not allowed') ||
    message.includes('insufficient')
  ) {
    return new IntegrationError(
      'LINEAR_FORBIDDEN',
      'Linear ei salli tätä toimintoa. Tarkista integraation oikeudet (read/write).',
      403,
    )
  }

  if (
    code.includes('RATE') ||
    type.includes('rate') ||
    message.includes('rate limit') ||
    message.includes('too many requests')
  ) {
    return new IntegrationError(
      'LINEAR_RATE_LIMITED',
      'Linearin rajaa ylitettiin. Odota hetki ja yritä synkkaa uudelleen.',
      429,
    )
  }

  if (
    code.includes('INPUT') ||
    code.includes('GRAPHQL_VALIDATION') ||
    type.includes('graphql_validation')
  ) {
    const detail = first?.message
    return new IntegrationError(
      'LINEAR_QUERY_ERROR',
      detail
        ? `Linear-kysely epäonnistui: ${detail}`
        : 'Linear-kysely epäonnistui. Ota yhteyttä tukeen, jos virhe toistuu.',
      502,
    )
  }

  const detail = first?.extensions?.userPresentableMessage ?? first?.message
  return new IntegrationError(
    'LINEAR_GRAPHQL_ERROR',
    detail
      ? `Linear palautti virheen: ${detail}`
      : 'Linear-synkka epäonnistui tuntemattomasta syystä. Yritä uudelleen.',
    502,
  )
}
