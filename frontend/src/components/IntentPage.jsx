import { useState, useEffect } from 'react'
import { getIntents } from '../services/api'

function IntentPage({ onBack }) {
  const [intents, setIntents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getIntents()
      setIntents(data.intents || [])
    } catch (error) {
      console.error('Failed to load intents:', error)
      // 使用默认数据作为降级
      setIntents([
        { id: 'food_query', name: '美食查询', keywords: ['好吃', '火锅', '吃', '推荐'], example: '成都哪里的火锅好吃？' },
        { id: 'travel_query', name: '旅游查询', keywords: ['景点', '哪里', '去', '玩'], example: '九寨沟门票好多钱？' },
        { id: 'weather_query', name: '天气查询', keywords: ['天气', '下雨', '热', '冷'], example: '今天成都天气咋样？' },
        { id: 'traffic_query', name: '交通查询', keywords: ['怎么走', '公交', '地铁', '路'], example: '去春熙路咋个走？' },
        { id: 'translation', name: '方言翻译', keywords: ['啥子', '意思', '翻译', '啥'], example: '巴适是啥子意思？' },
        { id: 'chat', name: '闲聊对话', keywords: ['摆', '龙门阵', '聊', '说'], example: '来摆个龙门阵嘛！' }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <h1 className="page-title">🎯 意图识别</h1>
      </div>
      <div className="page-content">
        <div className="section-description">
          系统支持的对话意图，了解如何与AI进行有效交流。
        </div>
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <div className="intent-list">
            {intents.map((intent, index) => (
              <div key={intent.id || index} className="intent-item">
                <h3 className="intent-name">{intent.name || intent.intent_name}</h3>
                <div className="intent-keywords">
                  关键词：
                  {(intent.keywords || intent.keywords_list || []).map((keyword, idx) => (
                    <span key={idx} className="keyword-tag">{keyword}</span>
                  ))}
                </div>
                <div className="intent-example">示例：{intent.example || intent.example_query || ''}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default IntentPage