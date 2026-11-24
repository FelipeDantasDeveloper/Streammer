import type { Streamer } from '../types/Streamer'

const STREAMERS_URL = 'https://api.chess.com/pub/streamers'
const REQUEST_TIMEOUT_MS = 10_000
const PROFILE_CONCURRENT_REQUESTS = 5
const countryCache = new Map<string, Promise<string | undefined>>()

interface ChessStreamer {
  username?: unknown
  name?: unknown
  avatar?: unknown
  is_live?: unknown
  twitch_url?: unknown
  platforms?: unknown
}

interface ChessPlatform {
  type?: unknown
  stream_url?: unknown
  channel_url?: unknown
  is_live?: unknown
  is_main_live_platform?: unknown
}

interface ChessStreamersResponse {
  streamers?: unknown
}

interface ChessPlayerResponse {
  country?: unknown
}

export class ChessApiError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'ChessApiError'
    this.status = status
  }
}

export function getChessApiErrorMessage(error: unknown): string {
  if (error instanceof ChessApiError) {
    switch (error.status) {
      case 400:
        return 'Não foi possível processar sua solicitação. Confira os dados e tente novamente.'
      case 403:
        return 'O acesso aos dados foi recusado. Tente novamente mais tarde.'
      case 404:
        return 'Nenhum perfil ou streamer foi encontrado.'
      case 429:
        return 'Muitas solicitações foram realizadas. Aguarde alguns instantes e tente novamente.'
      case 500:
        return 'O serviço está temporariamente indisponível. Tente novamente em instantes.'
      default:
        return 'Não foi possível concluir a solicitação. Verifique sua conexão e tente novamente.'
    }
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return 'A solicitação excedeu o tempo limite. Tente novamente em instantes.'
  }

  if (error instanceof TypeError) {
    return 'Não foi possível conectar ao Chess.com. Verifique sua conexão e tente novamente.'
  }

  return 'Não foi possível concluir a solicitação. Verifique sua conexão e tente novamente.'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

async function fetchJson(
  url: string,
  signal: AbortSignal,
): Promise<unknown> {
  const timeoutController = new AbortController()
  const timeoutId = window.setTimeout(
    () => timeoutController.abort(),
    REQUEST_TIMEOUT_MS,
  )

  const abortFromParent = () => timeoutController.abort()
  signal.addEventListener('abort', abortFromParent, { once: true })

  try {
    const response = await fetch(url, {
      signal: timeoutController.signal,
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new ChessApiError(
        `Chess.com returned HTTP ${response.status}`,
        response.status,
      )
    }

    try {
      return await response.json()
    } catch {
      throw new ChessApiError('A resposta da API do Chess.com é inválida.')
    }
  } finally {
    window.clearTimeout(timeoutId)
    signal.removeEventListener('abort', abortFromParent)
  }
}

async function fetchCountry(
  username: string,
  signal: AbortSignal,
): Promise<string | undefined> {
  try {
    const encodedUsername = encodeURIComponent(username)
    const data = await fetchJson(
      `https://api.chess.com/pub/player/${encodedUsername}`,
      signal,
    )

    if (!isRecord(data)) return undefined

    const player = data as ChessPlayerResponse
    if (typeof player.country !== 'string') return undefined

    const countryUrl = player.country.trim()
    if (!countryUrl) return undefined

    const cachedCountry = countryCache.get(countryUrl)
    if (cachedCountry) return cachedCountry

    const countryRequest = (async () => {
      try {
        const countryData = await fetchJson(countryUrl, signal)
        if (!isRecord(countryData)) return undefined

        return typeof countryData.name === 'string' &&
          countryData.name.trim()
          ? countryData.name.trim()
          : undefined
      } catch {
        return undefined
      }
    })()

    countryCache.set(countryUrl, countryRequest)
    return countryRequest
  } catch (error) {
    if (signal.aborted) throw error
    return undefined
  }
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  mapper: (item: T) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length)
  let nextIndex = 0

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex
      nextIndex += 1
      results[index] = await mapper(items[index])
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, () => worker()),
  )
  return results
}

export async function fetchStreamers(
  signal: AbortSignal,
): Promise<Streamer[]> {
  const data = await fetchJson(STREAMERS_URL, signal)

  if (!isRecord(data) || !Array.isArray((data as ChessStreamersResponse).streamers)) {
    throw new ChessApiError('A resposta da API do Chess.com é inválida.')
  }

  const streamers = (data as ChessStreamersResponse).streamers as unknown[]

  const normalized = streamers.flatMap((value): Streamer[] => {
    if (!isRecord(value)) return []

    const streamer = value as ChessStreamer
    const username = optionalString(streamer.username)
    if (!username) return []

    const platforms = Array.isArray(streamer.platforms)
      ? streamer.platforms.filter(isRecord) as ChessPlatform[]
      : []
    const mainPlatform =
      platforms.find((platform) => platform.is_main_live_platform === true) ??
      platforms.find((platform) => platform.is_live === true)

    const youtubePlatform = platforms.find(
      (platform) => platform.type === 'youtube',
    )
    const youtubeUrl =
      optionalString(youtubePlatform?.channel_url) ??
      optionalString(youtubePlatform?.stream_url)
    const platformUrl =
      optionalString(mainPlatform?.channel_url) ??
      optionalString(mainPlatform?.stream_url) ??
      optionalString(streamer.twitch_url)

    return [{
      username,
      name: optionalString(streamer.name),
      avatar: optionalString(streamer.avatar),
      isLive: streamer.is_live === true,
      youtubeUrl,
      platformUrl,
    }]
  })

  if (normalized.length === 0) return []

  return mapWithConcurrency(
    normalized,
    PROFILE_CONCURRENT_REQUESTS,
    async (streamer) => ({
      ...streamer,
      country: await fetchCountry(streamer.username, signal),
    }),
  )
}
