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
      setSessions([])
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
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
        <h3 className="menu-title">历史会话</h3>
        {loading ? (
          <div className="loading-small">加载中...</div>
        ) : sessions.length === 0 ? (
          <div className="empty-chats">
            <span>暂无历史会话</span>
            <span className="empty-hint">请返回主页开始聊天</span>
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
      </div>
    </aside>
  )
}

export default Sidebar