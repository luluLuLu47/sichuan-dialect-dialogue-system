import { useState } from 'react'
import HomePage from './components/HomePage'
import ChatPage from './components/ChatPage'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedDialect, setSelectedDialect] = useState(null)

  const handleSelectDialect = (dialect) => {
    setSelectedDialect(dialect)
    setCurrentPage('chat')
  }

  const handleBack = () => {
    setCurrentPage('home')
    setSelectedDialect(null)
  }

  return (
    <div className="app">
      {currentPage === 'home' && (
        <HomePage onSelectDialect={handleSelectDialect} />
      )}
      {currentPage === 'chat' && selectedDialect && (
        <ChatPage dialect={selectedDialect} onBack={handleBack} />
      )}
    </div>
  )
}

export default App