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

export async function searchEntity(query, entityType = null) {
  let url = `${API_BASE}/api/v1/knowledge/search?query=${encodeURIComponent(query)}`
  if (entityType) url += `&entity_type=${entityType}`
  const response = await fetch(url)
  if (!response.ok) throw new Error('Failed to search entity')
  return response.json()
}

export async function getFoodDetail(foodName) {
  const response = await fetch(`${API_BASE}/api/v1/knowledge/food/${encodeURIComponent(foodName)}`)
  if (!response.ok) throw new Error('Failed to fetch food detail')
  return response.json()
}

export async function getAttractionDetail(attractionName) {
  const response = await fetch(`${API_BASE}/api/v1/knowledge/attraction/${encodeURIComponent(attractionName)}`)
  if (!response.ok) throw new Error('Failed to fetch attraction detail')
  return response.json()
}

export async function getSessions() {
  const response = await fetch(`${API_BASE}/api/v1/memory/sessions`)
  if (!response.ok) throw new Error('Failed to fetch sessions')
  return response.json()
}

export async function getSessionDetail(sessionId) {
  const response = await fetch(`${API_BASE}/api/v1/memory/session/${sessionId}`)
  if (!response.ok) throw new Error('Failed to fetch session detail')
  return response.json()
}

export async function updateSessionSummary(sessionId, summary, messagesCount = 0) {
  const params = new URLSearchParams({ summary, messages_count: messagesCount.toString() })
  const response = await fetch(`${API_BASE}/api/v1/memory/session/${sessionId}/summary?${params}`, {
    method: 'POST'
  })
  if (!response.ok) throw new Error('Failed to update session summary')
  return response.json()
}

export async function addMemory(sessionId, content, memoryType = 'short_term', summary = '') {
  const params = new URLSearchParams({ content, memory_type: memoryType, summary })
  const response = await fetch(`${API_BASE}/api/v1/memory/session/${sessionId}/memory?${params}`, {
    method: 'POST'
  })
  if (!response.ok) throw new Error('Failed to add memory')
  return response.json()
}