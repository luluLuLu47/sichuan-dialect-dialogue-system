import { useState, useEffect } from 'react'
import { getFoods, getAttractions, getCustoms } from '../services/api'

function CulturePage({ onBack }) {
  const [foods, setFoods] = useState([])
  const [attractions, setAttractions] = useState([])
  const [customs, setCustoms] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [foodsData, attractionsData, customsData] = await Promise.all([
        getFoods(),
        getAttractions(),
        getCustoms()
      ])
      setFoods(foodsData.foods || [])
      setAttractions(attractionsData.attractions || [])
      setCustoms(customsData.customs || [])
    } catch (error) {
      console.error('Failed to load culture data:', error)
      // 使用默认数据作为降级
      setFoods(['火锅', '串串香', '担担面', '麻婆豆腐', '宫保鸡丁', '夫妻肺片'])
      setAttractions(['成都大熊猫基地', '都江堰', '青城山', '乐山大佛', '峨眉山', '九寨沟'])
      setCustoms(['摆龙门阵', '坐茶铺', '九大碗', '川剧变脸', '麻将文化', '坝坝舞'])
    } finally {
      setLoading(false)
    }
  }

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
        {loading ? (
          <div className="loading">加载中...</div>
        ) : (
          <div className="culture-categories">
            <div className="category-card">
              <h2 className="category-title">🍲 四川美食</h2>
              <div className="category-items">
                {foods.map((item, index) => (
                  <span key={index} className="category-item">
                    {typeof item === 'string' ? item : item.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="category-card">
              <h2 className="category-title">🏞️ 旅游景点</h2>
              <div className="category-items">
                {attractions.map((item, index) => (
                  <span key={index} className="category-item">
                    {typeof item === 'string' ? item : item.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="category-card">
              <h2 className="category-title">🎉 民俗文化</h2>
              <div className="category-items">
                {customs.map((item, index) => (
                  <span key={index} className="category-item">
                    {typeof item === 'string' ? item : item.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="category-card">
              <h2 className="category-title">🗣️ 方言表达</h2>
              <div className="category-items">
                <span className="category-item">巴适得板</span>
                <span className="category-item">安逸惨了</span>
                <span className="category-item">雄起</span>
                <span className="category-item">瓜娃子</span>
                <span className="category-item">要得</span>
                <span className="category-item">莫得问题</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CulturePage