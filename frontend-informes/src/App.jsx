import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app-container">
      <header>
        <h1>FullControl GPS - Sistema de Informes</h1>
        <p>Frontend para reportes y análisis</p>
      </header>

      <main>
        <section className="info">
          <h2>Estado del Sistema</h2>
          <p>✓ Frontend conectado</p>
          <p>✓ Backend en desarrollo</p>
          <button onClick={() => setCount((count) => count + 1)}>
            Contador: {count}
          </button>
        </section>
      </main>

      <footer>
        <p>FullControl GPS © 2026</p>
      </footer>
    </div>
  )
}

export default App
