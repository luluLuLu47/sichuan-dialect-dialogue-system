function CulturePage({ onBack }) {
  const categories = [
    {
      id: 'food',
      title: '🍲 四川美食',
      items: ['火锅', '串串香', '担担面', '麻婆豆腐', '宫保鸡丁', '夫妻肺片']
    },
    {
      id: 'attractions',
      title: '🏞️ 旅游景点',
      items: ['成都大熊猫基地', '都江堰', '青城山', '乐山大佛', '峨眉山', '九寨沟']
    },
    {
      id: 'customs',
      title: '🎉 民俗文化',
      items: ['摆龙门阵', '坐茶铺', '九大碗', '川剧变脸', '麻将文化', '坝坝舞']
    },
    {
      id: 'dialect',
      title: '🗣️ 方言表达',
      items: ['巴适得板', '安逸惨了', '雄起', '瓜娃子', '要得', '莫得问题']
    }
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <h1 className="page-title">🏮 文化百科</h1>
      </div>
      <div className="page-content">
        <div className="section-description">
          探索四川文化，了解美食、景点、民俗和方言。
        </div>
        <div className="culture-categories">
          {categories.map((category) => (
            <div key={category.id} className="category-card">
              <h2 className="category-title">{category.title}</h2>
              <div className="category-items">
                {category.items.map((item, index) => (
                  <span key={index} className="category-item">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default CulturePage