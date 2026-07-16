import { useState, useEffect } from 'react'

function HomePage({ onNavigate }) {
  const [activeAttraction, setActiveAttraction] = useState(0)
  const [activeFood, setActiveFood] = useState(0)
  const [activeCulture, setActiveCulture] = useState(0)

  const sichuanDialect = {
    id: 'sichuan',
    name: '四川话',
    subtitle: '摆龙门阵，安逸得板',
    icon: '🐼'
  }

  const features = [
    {
      id: 'chat',
      icon: '💬',
      title: '开始聊天',
      description: '和AI用四川话摆龙门阵',
      color: 'linear-gradient(135deg, #C41E3A 0%, #8B0000 100%)',
      onClick: () => onNavigate('chat')
    },
    {
      id: 'dictionary',
      icon: '📖',
      title: '方言词典',
      description: '查询四川方言词汇',
      color: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
      onClick: () => onNavigate('dictionary')
    },
    {
      id: 'scenes',
      icon: '🎭',
      title: '场景对话',
      description: '常用对话场景模板',
      color: 'linear-gradient(135deg, #1565C0 0%, #0D47A1 100%)',
      onClick: () => onNavigate('scenes')
    },
    {
      id: 'culture',
      icon: '🏮',
      title: '文化百科',
      description: '美食、景点、民俗',
      color: 'linear-gradient(135deg, #D4A574 0%, #B8860B 100%)',
      onClick: () => onNavigate('culture')
    },
    {
      id: 'intent',
      icon: '🎯',
      title: '意图识别',
      description: '对话意图分析',
      color: 'linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%)',
      onClick: () => onNavigate('intent')
    }
  ]

  const attractions = [
    {
      name: '都江堰',
      description: '世界文化遗产，千年水利工程',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dujiangyan%20ancient%20water%20conservancy%20project%20Sichuan%20traditional%20architecture%20green%20mountains&image_size=square'
    },
    {
      name: '乐山大佛',
      description: '世界最大石刻弥勒佛像',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Leshan%20Giant%20Buddha%20carved%20into%20mountain%20cliff%20majestic%20ancient%20art&image_size=square'
    },
    {
      name: '九寨沟',
      description: '人间仙境，五彩池美不胜收',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Jiuzhaigou%20Valley%20colorful%20lakes%20waterfalls%20beautiful%20nature%20crystal%20clear%20water&image_size=square'
    },
    {
      name: '峨眉山',
      description: '四大佛教名山之一，云海金顶',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Emei%20Mountain%20golden%20summit%20Buddhist%20temple%20clouds%20sea%20scenic&image_size=square'
    }
  ]

  const foods = [
    {
      name: '四川火锅',
      description: '麻辣鲜香，巴适得板',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Sichuan%20hotpot%20red%20spicy%20broth%20meat%20vegetables%20Chinese%20cuisine&image_size=square'
    },
    {
      name: '担担面',
      description: '百年名小吃，麻辣鲜香',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dan%20Dan%20noodles%20Sichuan%20spicy%20minced%20pork%20Chinese%20street%20food&image_size=square'
    },
    {
      name: '麻婆豆腐',
      description: '经典川菜，麻辣嫩滑',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Mapo%20tofu%20Sichuan%20cuisine%20spicy%20tofu%20dish%20red%20chili%20peppers&image_size=square'
    },
    {
      name: '串串香',
      description: '街头美食，香辣过瘾',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chuan%20Chuan%20xiang%20Sichuan%20street%20food%20skewers%20spicy&image_size=square'
    }
  ]

  const cultures = [
    {
      name: '川剧变脸',
      description: '中国国粹，神奇技艺',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Sichuan%20opera%20face%20changing%20performance%20traditional%20colorful%20mask&image_size=square'
    },
    {
      name: '大熊猫',
      description: '国宝萌宠，四川骄傲',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20giant%20panda%20eating%20bamboo%20adorable%20national%20treasure&image_size=square'
    },
    {
      name: '茶馆文化',
      description: '悠闲生活，摆龙门阵',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Sichuan%20tea%20house%20elderly%20drinking%20tea%20Chinese%20culture&image_size=square'
    },
    {
      name: '蜀绣',
      description: '四大名绣之一，精美绝伦',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Sichuan%20embroidery%20beautiful%20Chinese%20traditional%20art%20silk%20craftwork&image_size=square'
    }
  ]

  useEffect(() => {
    const interval1 = setInterval(() => {
      setActiveAttraction(prev => (prev + 1) % attractions.length)
    }, 4000)
    const interval2 = setInterval(() => {
      setActiveFood(prev => (prev + 1) % foods.length)
    }, 5000)
    const interval3 = setInterval(() => {
      setActiveCulture(prev => (prev + 1) % cultures.length)
    }, 6000)

    return () => {
      clearInterval(interval1)
      clearInterval(interval2)
      clearInterval(interval3)
    }
  }, [])

  return (
    <div className="home-page">
      <div className="hero-section">
        <div className="hero-bg-pattern"></div>
        <div className="hero-content">
          <div className="panda-icon">🐼</div>
          <h1 className="hero-title">小方言</h1>
          <p className="hero-subtitle">四川方言智能对话系统</p>
          <p className="hero-description">
            用地道的四川方言与AI对话，探索川味文化，感受语言魅力。
          </p>
        </div>
      </div>

      <div className="section features-section">
        <div className="section-header">
          <h2 className="section-title">🎯 功能入口</h2>
          <p className="section-subtitle">选择你想要体验的功能</p>
        </div>
        <div className="features-grid">
          {features.map((item, index) => (
            <div
              key={index}
              className="feature-card"
              style={{ background: item.color }}
              onClick={item.onClick}
            >
              <span className="feature-icon">{item.icon}</span>
              <h3 className="feature-title">{item.title}</h3>
              <p className="feature-desc">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="section showcase-section">
        <div className="section-header">
          <h2 className="section-title">🌄 四川印象</h2>
          <p className="section-subtitle">美景、美食、文化，等你来探索</p>
        </div>
        <div className="showcase-grid">
          <div className="showcase-card">
            <div className="showcase-icon">🏞️</div>
            <h3 className="showcase-title">四川美景</h3>
            <div className="showcase-slider">
              <img
                src={attractions[activeAttraction].image}
                alt={attractions[activeAttraction].name}
                className="showcase-image"
              />
              <div className="showcase-info">
                <h4>{attractions[activeAttraction].name}</h4>
                <p>{attractions[activeAttraction].description}</p>
              </div>
              <div className="showcase-dots">
                {attractions.map((_, idx) => (
                  <span
                    key={idx}
                    className={`dot ${idx === activeAttraction ? 'active' : ''}`}
                    onClick={() => setActiveAttraction(idx)}
                  ></span>
                ))}
              </div>
            </div>
          </div>

          <div className="showcase-card">
            <div className="showcase-icon">🍲</div>
            <h3 className="showcase-title">四川美食</h3>
            <div className="showcase-slider">
              <img
                src={foods[activeFood].image}
                alt={foods[activeFood].name}
                className="showcase-image"
              />
              <div className="showcase-info">
                <h4>{foods[activeFood].name}</h4>
                <p>{foods[activeFood].description}</p>
              </div>
              <div className="showcase-dots">
                {foods.map((_, idx) => (
                  <span
                    key={idx}
                    className={`dot ${idx === activeFood ? 'active' : ''}`}
                    onClick={() => setActiveFood(idx)}
                  ></span>
                ))}
              </div>
            </div>
          </div>

          <div className="showcase-card">
            <div className="showcase-icon">🎭</div>
            <h3 className="showcase-title">传统文化</h3>
            <div className="showcase-slider">
              <img
                src={cultures[activeCulture].image}
                alt={cultures[activeCulture].name}
                className="showcase-image"
              />
              <div className="showcase-info">
                <h4>{cultures[activeCulture].name}</h4>
                <p>{cultures[activeCulture].description}</p>
              </div>
              <div className="showcase-dots">
                {cultures.map((_, idx) => (
                  <span
                    key={idx}
                    className={`dot ${idx === activeCulture ? 'active' : ''}`}
                    onClick={() => setActiveCulture(idx)}
                  ></span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-section">
        <div className="footer-content">
          <span className="footer-icon">🐼</span>
          <p>用方言连接你我，让文化活起来</p>
        </div>
      </div>
    </div>
  )
}

export default HomePage