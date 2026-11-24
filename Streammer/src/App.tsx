import './App.css'

function App() {
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
          <div className="streamer-grid" aria-live="polite"></div>
        </section>
      </main>
    </div>
  )
}

export default App
