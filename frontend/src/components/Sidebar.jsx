function Sidebar({ dialect, onBack }) {
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

      <div className="sidebar-actions">
        <button className="action-btn">
          <span className="action-icon">➕</span>
          摆个新龙门阵
        </button>
      </div>

      <div className="sidebar-chats">
        <div className="chat-item active">
          <div className="chat-icon">💬</div>
          <div className="chat-info">
            <span className="chat-name">默认会话</span>
            <span className="chat-desc">开始对话</span>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar