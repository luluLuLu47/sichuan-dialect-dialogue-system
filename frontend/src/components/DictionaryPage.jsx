function DictionaryPage({ onBack }) {
  const dictionaryItems = [
    { dialect: '巴适', meaning: '舒服、安逸', example: '这个火锅吃起巴适得板！' },
    { dialect: '安逸', meaning: '舒服、棒', example: '今天天气安逸得很！' },
    { dialect: '扯把子', meaning: '聊天、吹牛', example: '我们来扯哈把子嘛！' },
    { dialect: '摆龙门阵', meaning: '聊天、闲聊', example: '有空来摆个龙门阵！' },
    { dialect: '雄起', meaning: '加油、振作', example: '雄起！四川队！' },
    { dialect: '瓜娃子', meaning: '傻瓜、笨蛋', example: '你个瓜娃子！' },
    { dialect: '哈儿', meaning: '傻瓜', example: '你真是个哈儿！' },
    { dialect: '莫得', meaning: '没有', example: '我莫得钱了！' },
    { dialect: '晓得', meaning: '知道', example: '你晓得不？' },
    { dialect: '要得', meaning: '好的、可以', example: '要得嘛！' }
  ]

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <h1 className="page-title">📖 方言词典</h1>
      </div>
      <div className="page-content">
        <div className="section-description">
          四川方言常用词汇查询，了解地道川味表达。
        </div>
        <div className="dictionary-list">
          {dictionaryItems.map((item, index) => (
            <div key={index} className="dictionary-item">
              <div className="dialect-word">{item.dialect}</div>
              <div className="word-meaning">{item.meaning}</div>
              <div className="word-example">例句：{item.example}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DictionaryPage