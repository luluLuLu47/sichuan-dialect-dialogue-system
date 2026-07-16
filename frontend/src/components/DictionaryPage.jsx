import { useState, useEffect } from 'react'
import { getDialectWords, searchEntity } from '../services/api'

function DictionaryPage({ onBack }) {
  const [dictionaryItems, setDictionaryItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedWord, setSelectedWord] = useState(null)
  const [wordDetail, setWordDetail] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getDialectWords(searchTerm, 50)
      const words = data.data || data.words || []
      setDictionaryItems(words.map(w => ({
        word: w.word || w.dialect,
        meaning: w.meanings?.[0] || w.standard_form || w.meaning || '暂无释义',
        example: w.example || '',
        pronunciation: w.pronunciation || ''
      })))
    } catch (error) {
      console.error('Failed to load dialect words:', error)
      setDictionaryItems([
        { word: '巴适', meaning: '舒服、安逸', example: '这个火锅吃起巴适得板！', pronunciation: 'bā shì' },
        { word: '安逸', meaning: '舒服、棒', example: '今天天气安逸得很！', pronunciation: 'ān yì' },
        { word: '扯把子', meaning: '聊天、吹牛', example: '我们来扯哈把子嘛！', pronunciation: 'chě bà zi' },
        { word: '摆龙门阵', meaning: '聊天、闲聊', example: '有空来摆个龙门阵！', pronunciation: 'bǎi lóng mén zhèn' },
        { word: '雄起', meaning: '加油、振作', example: '雄起！四川队！', pronunciation: 'xióng qǐ' },
        { word: '瓜娃子', meaning: '傻瓜、笨蛋（亲昵）', example: '你个瓜娃子！', pronunciation: 'guā wá zi' },
        { word: '要得', meaning: '好的、可以', example: '要得嘛！', pronunciation: 'yào de' },
        { word: '莫得', meaning: '没有', example: '莫得问题！', pronunciation: 'mò de' },
        { word: '咋个', meaning: '怎么', example: '咋个弄哦？', pronunciation: 'zǎ ge' },
        { word: '啥子', meaning: '什么', example: '你说啥子？', pronunciation: 'shá zi' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setSelectedWord(null)
    setWordDetail(null)
    loadData()
  }

  const handleWordClick = async (word) => {
    setSelectedWord(word)
    try {
      const result = await searchEntity(word, 'dialect')
      if (result.status === 'success' && result.data) {
        setWordDetail(result.data)
      } else {
        setWordDetail(null)
      }
    } catch (error) {
      console.error('Search failed:', error)
      setWordDetail(null)
    }
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
        <div className="dictionary-layout">
          <div className="dictionary-list">
            {loading ? (
              <div className="loading">加载中...</div>
            ) : (
              dictionaryItems.map((item, index) => (
                <div
                  key={index}
                  className={`dictionary-item ${selectedWord === item.word ? 'selected' : ''}`}
                  onClick={() => handleWordClick(item.word)}
                >
                  <div className="dialect-word">{item.word}</div>
                  <div className="word-meaning">{item.meaning}</div>
                  {item.pronunciation && (
                    <div className="word-pronunciation">{item.pronunciation}</div>
                  )}
                  {item.example && (
                    <div className="word-example">例句：{item.example}</div>
                  )}
                </div>
              ))
            )}
          </div>
          {selectedWord && (
            <div className="word-detail-panel">
              <h3>🔍 {selectedWord} 详情</h3>
              {wordDetail ? (
                <div className="detail-content">
                  {wordDetail.image && (
                    <img src={wordDetail.image} alt={wordDetail.title} className="detail-image" />
                  )}
                  <h4>{wordDetail.title}</h4>
                  {wordDetail.summary && (
                    <p className="detail-summary">{wordDetail.summary}</p>
                  )}
                  {wordDetail.dialect_alias && (
                    <p><strong>方言别名：</strong>{wordDetail.dialect_alias}</p>
                  )}
                  {wordDetail.type && (
                    <p><strong>类型：</strong>{wordDetail.type}</p>
                  )}
                </div>
              ) : (
                <p className="no-detail">点击词汇查看详情...</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default DictionaryPage