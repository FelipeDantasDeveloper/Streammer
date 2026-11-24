import './App.css'
import { useEffect, useState } from 'react'
import {
  fetchStreamers,
  getChessApiErrorMessage,
} from './services/chessApi'
import type { Streamer } from './types/Streamer'

function StreamerCard({ streamer }: { streamer: Streamer }) {
  const channelUrl = streamer.youtubeUrl ?? streamer.platformUrl
  const fallbackInitial = streamer.name?.trim().charAt(0).toUpperCase()
    || streamer.username.charAt(0).toUpperCase()

  return (
    <article className="streamer-card">
      <div className="streamer-avatar">
        <span className="avatar-fallback" aria-hidden="true">
          {fallbackInitial}
        </span>
        {streamer.avatar && (
          <img
            src={streamer.avatar}
            alt={`Avatar de ${streamer.name || streamer.username}`}
            onError={(event) => {
              event.currentTarget.hidden = true
            }}
          />
        )}
      </div>

      <div className="streamer-card-content">
        <h3>{streamer.name || streamer.username}</h3>
        <p className="streamer-username">@{streamer.username}</p>
        <p className="streamer-country">
          {streamer.country ? `País: ${streamer.country}` : 'País não informado'}
        </p>

        <div className="streamer-card-footer">
          <span
            className={`live-status ${streamer.isLive ? 'is-live' : 'is-offline'}`}
            role="status"
          >
            <span className="status-dot" aria-hidden="true"></span>
            {streamer.isLive ? 'Ao vivo' : 'Offline'}
          </span>

          {channelUrl ? (
            <a
              className="channel-link"
              href={channelUrl}
              target="_blank"
              rel="noreferrer"
              aria-label={`Abrir canal de ${streamer.name || streamer.username} em nova aba`}
            >
              Ver canal
            </a>
          ) : (
            <span className="channel-unavailable">Canal não informado</span>
          )}
        </div>
      </div>
    </article>
  )
}

function App() {
  const [streamers, setStreamers] = useState<Streamer[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    async function loadStreamers(): Promise<void> {
      setIsLoading(true)
      setError(undefined)

      try {
        const data = await fetchStreamers(controller.signal)
        if (!controller.signal.aborted) {
          setStreamers(data)
        }
      } catch (loadError) {
        if (!controller.signal.aborted) {
          setError(getChessApiErrorMessage(loadError))
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false)
        }
      }
    }

    void loadStreamers()

    return () => {
      controller.abort()
    }
  }, [retryCount])

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="header-content">
          <a className="brand" href="/" aria-label="Streammer - início">
            Streammer
          </a>
        </div>
      </header>

      <main className="main-content">
        <section className="search-section" aria-labelledby="page-title">
          <h1 id="page-title">Streamers de xadrez</h1>
          <form className="search-form" role="search" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="streamer-search">Pesquisar streamer</label>
            <div className="search-controls">
              <input
                id="streamer-search"
                name="streamer"
                type="search"
                placeholder="Nome do streamer"
                autoComplete="off"
              />
              <button type="submit">Pesquisar</button>
            </div>
          </form>
        </section>

        <section className="streamer-section" aria-labelledby="streamer-heading">
          <h2 id="streamer-heading">Streamers</h2>
          <div className="streamer-grid" aria-live="polite">
            {isLoading && (
              <>
                {[0, 1, 2, 3, 4, 5].map((item) => (
                  <div className="streamer-skeleton" key={item} aria-hidden="true">
                    <span className="skeleton-avatar"></span>
                    <span className="skeleton-line skeleton-line-title"></span>
                    <span className="skeleton-line skeleton-line-short"></span>
                  </div>
                ))}
                <p className="sr-only" role="status">Carregando streamers...</p>
              </>
            )}
            {error && (
              <div className="state-panel" role="alert">
                <p>{error}</p>
                <button
                  className="retry-button"
                  type="button"
                  onClick={() => setRetryCount((count) => count + 1)}
                >
                  Tentar novamente
                </button>
              </div>
            )}
            {!isLoading && !error && streamers.length === 0 && (
              <p className="state-panel" role="status">Nenhum streamer encontrado.</p>
            )}
            {!isLoading && !error && streamers.map((streamer) => (
              <StreamerCard key={streamer.username} streamer={streamer} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
