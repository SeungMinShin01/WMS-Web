import { useEffect, useState } from 'react'

type PingResponse = {
  message: string
  respondedAt: string
}

function App() {
  const [ping, setPing] = useState<PingResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/ping')
      .then((res) => {
        // fetch는 404·500을 받아도 예외를 던지지 않는다. 직접 확인해야 한다.
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then(setPing)
      .catch((e) => setError(String(e)))
  }, [])

  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif' }}>
      <h1>WMS-Web</h1>
      {error && <p style={{ color: 'crimson' }}>백엔드 연결 실패: {error}</p>}
      {ping && (
        <p>
          백엔드 응답: <strong>{ping.message}</strong> ({ping.respondedAt})
        </p>
      )}
      {!ping && !error && <p>연결 확인 중…</p>}
    </div>
  )
}

export default App
