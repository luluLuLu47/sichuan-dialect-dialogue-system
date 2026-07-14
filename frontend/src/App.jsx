import { useState, useEffect, useRef } from 'react'
import Header from './components/Header'
import ChatWindow from './components/ChatWindow'
import InputArea from './components/InputArea'
import { sendMessage } from './services/api'

function App() {
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId] = useState(() => 
    'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  )
  const chatWindowRef = useRef(null)

  // 滚动到底部
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight
    }
  }, [messages])

  // 发送消息
  const handleSendMessage = async (text) => {
    if (!text.trim()) return

    // 添加用户消息
    const userMessage = {
      id: 'msg_' + Date.now(),
      type: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      // 调用API
      const response = await sendMessage(text, sessionId)
      
      // 添加系统回复
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
      // 错误提示
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
    <div className="app">
      <Header />
      <ChatWindow 
        messages={messages} 
        isLoading={isLoading}
        ref={chatWindowRef}
      />
      <InputArea onSend={handleSendMessage} disabled={isLoading} />
    </div>
  )
}

export default App