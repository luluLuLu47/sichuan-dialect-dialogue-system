import { useState, useEffect } from 'react'
import { getDialectWords } from '../services/api'

function DictionaryPage({ onBack }) {
  const [dictionaryItems, setDictionaryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getDialectWords(searchTerm, 50)
      setDictionaryItems(data.words || [])
    } catch (error) {
      console.error('Failed to load dialect words:', error)
      // 使用默认数据作为降级
      setDictionaryItems([
        { dialect: '巴适', meaning: '舒服、安逸', example: '这个火锅吃起巴适得板！' },
        { dialect: '安逸', meaning: '舒服、棒', example: '今天天气安逸得很！' },
        { dialect: '扯把子', meaning: '聊天、吹牛', example: '我们来扯哈把子嘛！' },
        { dialect: '摆龙门阵', meaning: '聊天、闲聊', example: '有空来摆个龙门阵！' },
        { dialect: '雄起', meaning: '加油、振作', example: '雄起！四川队！' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    loadData()
  }

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
        <div className="search-box">
          <input
            type="text"
            placeholder="搜索方言词汇..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch}>搜索</button>
        </div>
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <div className="dictionary-list">
            {dictionaryItems.map((item, index) => (
              <div key={index} className="dictionary-item">
                <div className="dialect-word">{item.dialect || item.word}</div>
                <div className="word-meaning">{item.meaning}</div>
                <div className="word-example">例句：{item.example}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default DictionaryPage