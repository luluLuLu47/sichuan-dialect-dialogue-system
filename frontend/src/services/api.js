const API_BASE = 'http://localhost:8000'

export async function sendMessage(message, sessionId) {
  const response = await fetch(`${API_BASE}/api/v1/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      message, 
      session_id: sessionId 
    })
  })
  
  if (!response.ok) {
    throw new Error('Network response was not ok')
  }
  
  return response.json()
}

export async function checkHealth() {
  const response = await fetch(`${API_BASE}/health`)
  return response.json()
}