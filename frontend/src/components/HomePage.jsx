function HomePage({ onStartChat }) {
  const sichuanDialect = {
    id: 'sichuan',
    name: '四川话',
    subtitle: '摆龙门阵，安逸得板',
    icon: '🌶️'
  }

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">小方言</h1>
          <p className="hero-subtitle">四川方言智能对话系统</p>
          <p className="hero-description">
            用地道的四川方言与AI对话，探索川味文化，感受语言魅力。
          </p>
        </div>
        
        <button 
          className="start-chat-btn"
          onClick={() => onStartChat(sichuanDialect)}
        >
          <span className="btn-icon">{sichuanDialect.icon}</span>
          <span className="btn-text">开始聊天</span>
        </button>
      </div>

      <div className="features-section">
        <h2 className="section-title">功能特色</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🗣️</div>
            <h3>方言对话</h3>
            <p>用地道四川话交流</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🍲</div>
            <h3>美食推荐</h3>
            <p>探索四川特色美食</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🏞️</div>
            <h3>景点介绍</h3>
            <p>了解四川旅游景点</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎉</div>
            <h3>民俗文化</h3>
            <p>体验四川风土人情</p>
          </div>
        </div>
      </div>

      <div className="footer-section">
        <p>用方言连接你我，让文化活起来</p>
      </div>
    </div>
  )
}

export default HomePage