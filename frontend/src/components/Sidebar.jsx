import { useState, useEffect } from 'react'
import { getSessions } from '../services/api'

function Sidebar({ onBack, onNavigate, currentSessionId, onSessionSelect }) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      setLoading(true)
      const result = await getSessions()
      setSessions(result.data || [])
    } catch (error) {
      console.error('Failed to load sessions:', error)
      setSessions([
        { session_id: 'default', summary: '开始新对话', updated_at: '刚刚', messages_count: 0 }
      ])
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    { id: 'chat', icon: '💬', label: '开始聊天', description: '摆龙门阵' },
    { id: 'dictionary', icon: '📖', label: '方言词典', description: '查询方言词汇' },
    { id: 'scenes', icon: '🎭', label: '场景对话', description: '常用对话场景' },
    { id: 'culture', icon: '🏮', label: '文化百科', description: '美食、景点、民俗' },
    { id: 'intent', icon: '🎯', label: '意图识别', description: '对话意图分析' }
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button className="back-btn" onClick={onBack}>
          ← 返回
        </button>
        <div className="logo">
          <span className="logo-icon">🌶️</span>
          <span className="logo-text">小方言</span>
        </div>
        <p className="logo-subtitle">摆龙门阵，安逸得板</p>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">admin</div>
        <span className="user-role">测试</span>
      </div>

      <div className="sidebar-menu">
        <h3 className="menu-title">功能入口</h3>
        {menuItems.map((item) => (
          <button
            key={item.id}
            className="menu-item"
            onClick={() => onNavigate(item.id)}
          >
            <span className="menu-icon">{item.icon}</span>
            <div className="menu-content">
              <span className="menu-label">{item.label}</span>
              <span className="menu-desc">{item.description}</span>
            </div>
          </button>
        ))}
      </div>

      <div className="sidebar-chats">
        <h3 className="menu-title">会话列表</h3>
        {loading ? (
          <div className="loading-small">加载中...</div>
        ) : sessions.length === 0 ? (
          <div className="chat-item" onClick={() => onNavigate('chat')}>
            <div className="chat-icon">💬</div>
            <div className="chat-info">
              <span className="chat-name">开始新对话</span>
              <span className="chat-desc">点击开始聊天</span>
            </div>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.session_id}
              className={`chat-item ${currentSessionId === session.session_id ? 'active' : ''}`}
              onClick={() => onSessionSelect && onSessionSelect(session.session_id)}
            >
              <div className="chat-icon">💬</div>
              <div className="chat-info">
                <span className="chat-name">{session.summary || '无标题对话'}</span>
                <span className="chat-desc">
                  {session.messages_count > 0 ? `${session.messages_count}条消息` : '新对话'}
                </span>
              </div>
              <span className="chat-time">{session.updated_at}</span>
            </div>
          ))
        )}
        <button className="new-chat-btn" onClick={() => onNavigate('chat')}>
          + 新对话
        </button>
      </div>
    </aside>
  )
}

export default Sidebar