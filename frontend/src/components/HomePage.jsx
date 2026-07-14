function HomePage({ onSelectDialect }) {
  const dialects = [
    {
      id: 'sichuan',
      name: '四川话',
      subtitle: '摆龙门阵，安逸得板',
      description: '四川方言智能对话，用地道川味与你交流',
      color: '#2E7D32',
      icon: '🌶️'
    },
    {
      id: 'cantonese',
      name: '粤语',
      subtitle: '讲广东话，好犀利',
      description: '粤语方言智能对话，体验岭南文化',
      color: '#1976D2',
      icon: '🏮'
    },
    {
      id: 'shanghai',
      name: '上海话',
      subtitle: '讲上海闲话，老灵额',
      description: '上海方言智能对话，感受海派风情',
      color: '#E65100',
      icon: '🏙️'
    },
    {
      id: 'beijing',
      name: '北京话',
      subtitle: '唠唠嗑，倍儿爽',
      description: '北京方言智能对话，体验京味儿文化',
      color: '#7B1FA2',
      icon: '🗼'
    },
    {
      id: 'hunan',
      name: '湖南话',
      subtitle: '策一策，韵味足',
      description: '湖南方言智能对话，感受湘楚文化',
      color: '#00838F',
      icon: '🌿'
    },
    {
      id: 'dongbei',
      name: '东北话',
      subtitle: '唠嗑唠嗑，贼拉有意思',
      description: '东北方言智能对话，体验豪爽幽默',
      color: '#F57C00',
      icon: '❄️'
    }
  ]

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">小方言</h1>
          <p className="hero-subtitle">探索中国方言文化，用家乡话聊天</p>
          <p className="hero-description">
            智能方言对话系统，支持多种方言交流，让语言不再是障碍，让文化得以传承。
          </p>
        </div>
      </div>

      <div className="dialects-section">
        <h2 className="section-title">选择方言</h2>
        <div className="dialects-grid">
          {dialects.map((dialect) => (
            <div 
              key={dialect.id}
              className="dialect-card"
              style={{ '--card-color': dialect.color }}
              onClick={() => onSelectDialect(dialect)}
            >
              <div className="card-icon">{dialect.icon}</div>
              <div className="card-content">
                <h3 className="card-title">{dialect.name}</h3>
                <p className="card-subtitle">{dialect.subtitle}</p>
                <p className="card-description">{dialect.description}</p>
              </div>
              <div className="card-arrow">→</div>
            </div>
          ))}
        </div>
      </div>

      <div className="footer-section">
        <p>用方言连接你我，让文化活起来</p>
      </div>
    </div>
  )
}

export default HomePage