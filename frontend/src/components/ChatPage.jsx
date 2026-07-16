import { useState, useEffect, useRef, useCallback } from 'react'
import Sidebar from './Sidebar'
import ChatWindow from './ChatWindow'
import InputArea from './InputArea'
import { sendMessage, updateSessionSummary, addMemory } from '../services/api'

function ChatPage({ dialect, onBack, onNavigate }) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState(() => 
    'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  )
  const [sessionSummary, setSessionSummary] = useState('')
  const [shortTermMemory, setShortTermMemory] = useState([])
  const chatWindowRef = useRef(null)

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
    }
  }, [messages])

  useEffect(() => {
    const welcomeMessage = {
      id: 'msg_' + Date.now(),
      type: 'system',
      content: `来嘛，摆起走！想问啥子都可以问我哦~`,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    setMessages([welcomeMessage])
    setShortTermMemory([{ content: '欢迎语：来嘛，摆起走！', timestamp: new Date().toLocaleString() }])
  }, [])

  const generateSummary = useCallback((currentMessages) => {
    const userMessages = currentMessages.filter(m => m.type === 'user')
    if (userMessages.length === 0) return '新对话'
    if (userMessages.length === 1) return userMessages[0].content.substring(0, 20) + (userMessages[0].content.length > 20 ? '...' : '')
    
    const firstMsg = userMessages[0].content.substring(0, 10)
    const lastMsg = userMessages[userMessages.length - 1].content.substring(0, 10)
    return `${firstMsg}...${lastMsg}`
  }, [])

  const handleSendMessage = async (text) => {
    if (!text.trim()) return

    const userMessage = {
      id: 'msg_' + Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMessage])
    setShortTermMemory(prev => [...prev.slice(-19), { content: `用户：${text}`, timestamp: new Date().toLocaleString() }])
    setIsLoading(true)

    try {
      const response = await sendMessage(text, sessionId)
      
      const systemMessage = {
        id: 'msg_' + Date.now(),
        type: 'system',
        content: response.response,
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        intent: response.intent,
        confidence: response.confidence
      }
      setMessages(prev => [...prev, systemMessage])
      setShortTermMemory(prev => [...prev.slice(-19), { content: `AI：${response.response.substring(0, 30)}${response.response.length > 30 ? '...' : ''}`, timestamp: new Date().toLocaleString() }])

      const newMessages = [...messages, userMessage, systemMessage]
      const summary = generateSummary(newMessages)
      setSessionSummary(summary)

      await updateSessionSummary(sessionId, summary, newMessages.filter(m => m.type !== 'system' || m.content !== '来嘛，摆起走！想问啥子都可以问我哦~').length)
      await addMemory(sessionId, text, 'short_term', response.intent)

    } catch (error) {
      const errorMessage = {
        id: 'msg_' + Date.now(),
        type: 'system',
        content: '抱歉，网络出现问题，请稍后再试。',
        timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        isError: true
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSessionSelect = (newSessionId) => {
    setSessionId(newSessionId)
    setMessages([])
    setShortTermMemory([])
    setSessionSummary('')
  }

  return (
    <div className="chat-page">
      <Sidebar 
        onBack={onBack} 
        onNavigate={onNavigate} 
        currentSessionId={sessionId}
        onSessionSelect={handleSessionSelect}
      />
      <div className="chat-main">
        <div className="chat-header">
          <div className="header-info">
            <span className="header-icon">{dialect.icon}</span>
            <div>
              <h2 className="header-title">摆龙门阵咯</h2>
              <p className="header-subtitle">用四川话聊天 | 自动记到 | 巴适得板</p>
            </div>
          </div>
          <button className="header-dialect-btn">
            {dialect.icon} {dialect.name}
          </button>
        </div>
        <ChatWindow 
          messages={messages} 
          isLoading={isLoading}
          ref={chatWindowRef}
        />
        <InputArea onSend={handleSendMessage} disabled={isLoading} />
        
        {shortTermMemory.length > 0 && (
          <div className="memory-panel">
            <h4>📝 短期记忆</h4>
            <div className="memory-list">
              {shortTermMemory.slice(-5).map((item, index) => (
                <div key={index} className="memory-item">
                  <span className="memory-content">{item.content}</span>
                  <span className="memory-time">{item.timestamp}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPage