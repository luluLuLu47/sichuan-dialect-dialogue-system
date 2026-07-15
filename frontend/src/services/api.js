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

// 知识图谱数据获取函数
export async function getDialectWords(search = '', limit = 20) {
  const params = new URLSearchParams({ limit: limit.toString() })
  if (search) params.append('search', search)
  const response = await fetch(`${API_BASE}/api/v1/knowledge/dialect-words?${params}`)
  if (!response.ok) throw new Error('Failed to fetch dialect words')
  return response.json()
}

export async function getScenes() {
  const response = await fetch(`${API_BASE}/api/v1/knowledge/scenes`)
  if (!response.ok) throw new Error('Failed to fetch scenes')
  return response.json()
}

export async function getFoods(region = null) {
  const params = region ? `?region=${encodeURIComponent(region)}` : ''
  const response = await fetch(`${API_BASE}/api/v1/knowledge/foods${params}`)
  if (!response.ok) throw new Error('Failed to fetch foods')
  return response.json()
}

export async function getAttractions(region = null) {
  const params = region ? `?region=${encodeURIComponent(region)}` : ''
  const response = await fetch(`${API_BASE}/api/v1/knowledge/attractions${params}`)
  if (!response.ok) throw new Error('Failed to fetch attractions')
  return response.json()
}

export async function getCustoms() {
  const response = await fetch(`${API_BASE}/api/v1/knowledge/customs`)
  if (!response.ok) throw new Error('Failed to fetch customs')
  return response.json()
}

export async function getIntents() {
  const response = await fetch(`${API_BASE}/api/v1/knowledge/intents`)
  if (!response.ok) throw new Error('Failed to fetch intents')
  return response.json()
}