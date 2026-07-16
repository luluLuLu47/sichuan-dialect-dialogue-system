import { useState } from 'react'
import HomePage from './components/HomePage'
import ChatPage from './components/ChatPage'
import DictionaryPage from './components/DictionaryPage'
import ScenesPage from './components/ScenesPage'
import CulturePage from './components/CulturePage'
import IntentPage from './components/IntentPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedDialect] = useState({
    id: 'sichuan',
    name: '四川话',
    icon: '🌶️'
  })

  const handleNavigate = (pageId) => {
    setCurrentPage(pageId)
  }

  const handleBack = () => {
    setCurrentPage('home')
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} />
      case 'chat':
        return (
          <ChatPage 
            dialect={selectedDialect} 
            onBack={handleBack}
            onNavigate={handleNavigate}
          />
        )
      case 'dictionary':
        return <DictionaryPage onBack={handleBack} />
      case 'scenes':
        return <ScenesPage onBack={handleBack} />
      case 'culture':
        return <CulturePage onBack={handleBack} />
      case 'intent':
        return <IntentPage onBack={handleBack} />
      default:
        return <HomePage onNavigate={handleNavigate} />
    }
  }

  return (
    <div className="app">
      {renderPage()}
    </div>
  )
}

export default App