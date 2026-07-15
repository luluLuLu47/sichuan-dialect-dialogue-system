import { useState, useEffect } from 'react'
import { getScenes } from '../services/api'

function ScenesPage({ onBack }) {
  const [scenes, setScenes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const data = await getScenes()
      setScenes(data.scenes || [])
    } catch (error) {
      console.error('Failed to load scenes:', error)
      // 使用默认数据作为降级
      setScenes([
        { id: 'food', icon: '🍲', name: '美食推荐', description: '火锅、串串、川菜', count: '50+' },
        { id: 'travel', icon: '🏞️', name: '旅游攻略', description: '景点介绍、路线规划', count: '20+' },
        { id: 'weather', icon: '🌤️', name: '天气日常', description: '天气查询、日常问候', count: '30+' },
        { id: 'traffic', icon: '🚗', name: '问路交通', description: '路线查询、交通指引', count: '25+' },
        { id: 'shopping', icon: '🛍️', name: '价格购物', description: '价格询问、购物建议', count: '35+' },
        { id: 'customs', icon: '🎉', name: '本地民俗', description: '节日习俗、风土人情', count: '15+' }
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← 返回</button>
        <h1 className="page-title">🎭 场景对话</h1>
      </div>
      <div className="page-content">
        <div className="section-description">
          多种日常场景对话模板，轻松应对各种交流场景。
        </div>
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <div className="scenes-grid">
            {scenes.map((scene, index) => (
              <div key={scene.id || index} className="scene-card">
                <div className="scene-icon">{scene.icon || '💬'}</div>
                <h3 className="scene-name">{scene.name || scene.scene_name}</h3>
                <p className="scene-desc">{scene.description || scene.scene_desc}</p>
                <span className="scene-count">{scene.count || scene.dialogue_count || 0} 语料</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ScenesPage