import './App.css'
import { useEffect, useState } from 'react'
import {
  fetchStreamers,
  getChessApiErrorMessage,
} from './services/chessApi'
import type { Streamer } from './types/Streamer'

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
            {isLoading && <p role="status">Carregando streamers...</p>}
            {error && (
              <div role="alert">
                <p>{error}</p>
                <button type="button" onClick={() => setRetryCount((count) => count + 1)}>
                  Tentar novamente
                </button>
              </div>
            )}
            {!isLoading && !error && (
              <p role="status">
                {streamers.length === 0
                  ? 'Nenhum streamer encontrado.'
                  : `${streamers.length} streamers carregados.`}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
