function HomePage({ onStartChat }) {
  const sichuanDialect = {
    id: 'sichuan',
    name: '四川话',
    subtitle: '摆龙门阵，安逸得板',
    icon: '🐼'
  }

  const attractions = [
    {
      name: '都江堰',
      description: '世界文化遗产，千年水利工程',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dujiangyan%20ancient%20water%20conservancy%20project%20in%20Sichuan%20China%20traditional%20architecture%20green%20mountains%20beautiful%20scenery&image_size=landscape_4_3'
    },
    {
      name: '乐山大佛',
      description: '世界最大石刻弥勒佛像',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Leshan%20Giant%20Buddha%20statue%20carved%20into%20mountain%20cliff%20Sichuan%20China%20majestic%20ancient%20art&image_size=landscape_4_3'
    },
    {
      name: '九寨沟',
      description: '人间仙境，五彩池美不胜收',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Jiuzhaigou%20Valley%20colorful%20lakes%20waterfalls%20Sichuan%20China%20beautiful%20nature%20scenery%20crystal%20clear%20water&image_size=landscape_4_3'
    },
    {
      name: '峨眉山',
      description: '四大佛教名山之一，云海金顶',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Emei%20Mountain%20golden%20summit%20Buddhist%20temple%20clouds%20sea%20Sichuan%20China%20scenic&image_size=landscape_4_3'
    }
  ]

  const foods = [
    {
      name: '四川火锅',
      description: '麻辣鲜香，巴适得板',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Sichuan%20hotpot%20red%20spicy%20broth%20meat%20vegetables%20Chinese%20cuisine%20delicious%20food&image_size=square'
    },
    {
      name: '担担面',
      description: '百年名小吃，麻辣鲜香',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Dan%20Dan%20noodles%20Sichuan%20spicy%20minced%20pork%20Chinese%20street%20food%20delicious&image_size=square'
    },
    {
      name: '麻婆豆腐',
      description: '经典川菜，麻辣嫩滑',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Mapo%20tofu%20Sichuan%20cuisine%20spicy%20tofu%20dish%20Chinese%20food%20red%20chili%20peppers&image_size=square'
    },
    {
      name: '串串香',
      description: '街头美食，香辣过瘾',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Chuan%20Chuan%20xiang%20Sichuan%20street%20food%20skewers%20spicy%20Chinese%20cuisine&image_size=square'
    }
  ]

  const cultures = [
    {
      name: '川剧变脸',
      description: '中国国粹，神奇技艺',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Sichuan%20opera%20face%20changing%20performance%20traditional%20Chinese%20opera%20colorful%20mask&image_size=square'
    },
    {
      name: '大熊猫',
      description: '国宝萌宠，四川骄傲',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20giant%20panda%20bear%20eating%20bamboo%20Sichuan%20China%20adorable%20national%20treasure&image_size=square'
    },
    {
      name: '茶馆文化',
      description: '悠闲生活，摆龙门阵',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20Sichuan%20tea%20house%20elderly%20people%20drinking%20tea%20playing%20mahjong%20Chinese%20culture&image_size=square'
    },
    {
      name: '蜀绣',
      description: '四大名绣之一，精美绝伦',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Sichuan%20embroidery%20beautiful%20Chinese%20traditional%20art%20silk%20craftwork%20intricate%20patterns&image_size=square'
    }
  ]

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
        
        <button 
          className="start-chat-btn"
          onClick={() => onStartChat(sichuanDialect)}
        >
          <span className="btn-icon">{sichuanDialect.icon}</span>
          <span className="btn-text">开始聊天</span>
        </button>
      </div>

      <div className="section attractions-section">
        <div className="section-header">
          <h2 className="section-title">🏞️ 四川美景</h2>
          <p className="section-subtitle">天府之国，山水如画</p>
        </div>
        <div className="cards-grid">
          {attractions.map((item, index) => (
            <div key={index} className="card">
              <div className="card-image-wrapper">
                <img src={item.image} alt={item.name} className="card-image" />
                <div className="card-overlay"></div>
              </div>
              <div className="card-content">
                <h3 className="card-title">{item.name}</h3>
                <p className="card-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section foods-section">
        <div className="section-header">
          <h2 className="section-title">🍲 四川美食</h2>
          <p className="section-subtitle">麻辣鲜香，回味无穷</p>
        </div>
        <div className="cards-grid">
          {foods.map((item, index) => (
            <div key={index} className="card">
              <div className="card-image-wrapper">
                <img src={item.image} alt={item.name} className="card-image" />
                <div className="card-overlay"></div>
              </div>
              <div className="card-content">
                <h3 className="card-title">{item.name}</h3>
                <p className="card-desc">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="section culture-section">
        <div className="section-header">
          <h2 className="section-title">🎭 四川文化</h2>
          <p className="section-subtitle">千年传承，独具魅力</p>
        </div>
        <div className="cards-grid">
          {cultures.map((item, index) => (
            <div key={index} className="card">
              <div className="card-image-wrapper">
                <img src={item.image} alt={item.name} className="card-image" />
                <div className="card-overlay"></div>
              </div>
              <div className="card-content">
                <h3 className="card-title">{item.name}</h3>
                <p className="card-desc">{item.description}</p>
              </div>
            </div>
          ))}
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