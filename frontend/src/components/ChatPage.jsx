import { useState, useEffect, useRef } from 'react'
import Sidebar from './Sidebar'
import ChatWindow from './ChatWindow'
import InputArea from './InputArea'
import { sendMessage } from '../services/api'

function ChatPage({ dialect, onBack }) {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => 
    'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  )
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

  return (
    <div className="chat-page">
      <Sidebar dialect={dialect} onBack={onBack} />
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
      </div>
    </div>
  )
}

export default ChatPage