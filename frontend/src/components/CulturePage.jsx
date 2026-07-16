import { useState, useEffect } from 'react'
import { getFoods, getAttractions, getCustoms, getFoodDetail, getAttractionDetail } from '../services/api'

function CulturePage({ onBack }) {
  const [foods, setFoods] = useState([])
  const [attractions, setAttractions] = useState([])
  const [customs, setCustoms] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState(null)
  const [itemDetail, setItemDetail] = useState(null)
  const [detailType, setDetailType] = useState('')

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
      setFoods(foodsData.data || foodsData.foods || [])
      setAttractions(attractionsData.data || attractionsData.attractions || [])
      setCustoms(customsData.data || customsData.customs || [])
    } catch (error) {
      console.error('Failed to load culture data:', error)
      setFoods(['火锅', '串串香', '担担面', '麻婆豆腐', '宫保鸡丁', '夫妻肺片', '折耳根', '钵钵鸡', '冒菜', '兔头'])
      setAttractions(['成都大熊猫基地', '都江堰', '青城山', '乐山大佛', '峨眉山', '九寨沟', '宽窄巷子', '锦里', '武侯祠', '杜甫草堂'])
      setCustoms(['摆龙门阵', '坐茶铺', '九大碗', '川剧变脸', '麻将文化', '坝坝舞'])
    } finally {
      setLoading(false)
    }
  }

  const handleFoodClick = async (food) => {
    const name = typeof food === 'string' ? food : food.name
    setSelectedItem(name)
    setDetailType('food')
    try {
      const result = await getFoodDetail(name)
      if (result.status === 'success' && result.data) {
        setItemDetail(result.data)
      } else {
        setItemDetail({ name, summary: `暂无${name}的详细信息` })
      }
    } catch (error) {
      console.error('Failed to fetch food detail:', error)
      setItemDetail({ name, summary: `获取${name}详情失败` })
    }
  }

  const handleAttractionClick = async (attraction) => {
    const name = typeof attraction === 'string' ? attraction : attraction.name
    setSelectedItem(name)
    setDetailType('attraction')
    try {
      const result = await getAttractionDetail(name)
      if (result.status === 'success' && result.data) {
        setItemDetail(result.data)
      } else {
        setItemDetail({ name, summary: `暂无${name}的详细信息` })
      }
    } catch (error) {
      console.error('Failed to fetch attraction detail:', error)
      setItemDetail({ name, summary: `获取${name}详情失败` })
    }
  }

  const handleCustomClick = (custom) => {
    const name = typeof custom === 'string' ? custom : custom.name
    setSelectedItem(name)
    setDetailType('custom')
    setItemDetail({
      name,
      summary: getCustomSummary(name)
    })
  }

  const getCustomSummary = (name) => {
    const summaries = {
      '摆龙门阵': '摆龙门阵是四川方言中特有的社交活动，指朋友之间轻松愉快地聊天、讲故事。四川人热爱摆龙门阵，茶馆、公园都是摆龙门阵的好地方。',
      '坐茶铺': '坐茶铺是四川人的传统休闲方式。四川茶馆遍布大街小巷，人们在这里喝茶、聊天、看报、下棋，享受悠闲的慢生活。',
      '九大碗': '九大碗是四川传统宴席，通常有九道大菜，象征长久和圆满。常见的菜品有蒸肉、蒸鱼、炖鸡等，是四川农村红白喜事的必备。',
      '川剧变脸': '川剧变脸是川剧表演中的特技之一，演员在瞬间变换脸谱颜色，展现人物情绪变化。是四川文化的重要象征。',
      '麻将文化': '麻将在四川非常流行，是四川人重要的娱乐方式。无论是家庭聚会还是朋友休闲，麻将都是不可或缺的活动。',
      '坝坝舞': '坝坝舞是四川街头的广场舞，人们在广场上随着音乐跳舞，既锻炼了身体，也增进了邻里关系。'
    }
    return summaries[name] || `${name}是四川重要的民俗文化活动。`
  }

  const closeDetail = () => {
    setSelectedItem(null)
    setItemDetail(null)
    setDetailType('')
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
                {foods.map((item, index) => {
                  const name = typeof item === 'string' ? item : item.name
                  return (
                    <span
                      key={index}
                      className="category-item clickable"
                      onClick={() => handleFoodClick(item)}
                    >
                      {name}
                    </span>
                  )
                })}
              </div>
            </div>
            <div className="category-card">
              <h2 className="category-title">🏞️ 旅游景点</h2>
              <div className="category-items">
                {attractions.map((item, index) => {
                  const name = typeof item === 'string' ? item : item.name
                  return (
                    <span
                      key={index}
                      className="category-item clickable"
                      onClick={() => handleAttractionClick(item)}
                    >
                      {name}
                    </span>
                  )
                })}
              </div>
            </div>
            <div className="category-card">
              <h2 className="category-title">🎉 民俗文化</h2>
              <div className="category-items">
                {customs.map((item, index) => {
                  const name = typeof item === 'string' ? item : item.name
                  return (
                    <span
                      key={index}
                      className="category-item clickable"
                      onClick={() => handleCustomClick(item)}
                    >
                      {name}
                    </span>
                  )
                })}
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

        {selectedItem && itemDetail && (
          <div className="detail-modal" onClick={closeDetail}>
            <div className="detail-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeDetail}>×</button>
              <h3 className="modal-title">
                {detailType === 'food' && '🍲'}
                {detailType === 'attraction' && '🏞️'}
                {detailType === 'custom' && '🎉'}
                {itemDetail.name || itemDetail.title}
              </h3>
              {itemDetail.image && (
                <img src={itemDetail.image} alt={itemDetail.name} className="modal-image" />
              )}
              <div className="modal-info">
                {itemDetail.dialect_alias && (
                  <p><strong>方言别名：</strong>{itemDetail.dialect_alias}</p>
                )}
                {itemDetail.type && (
                  <p><strong>类型：</strong>{itemDetail.type}</p>
                )}
                {itemDetail.region && (
                  <p><strong>地区：</strong>{itemDetail.region}</p>
                )}
                {itemDetail.phrase && (
                  <p><strong>推荐语：</strong>{itemDetail.phrase}</p>
                )}
                {itemDetail.summary && (
                  <p className="modal-summary">{itemDetail.summary}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CulturePage