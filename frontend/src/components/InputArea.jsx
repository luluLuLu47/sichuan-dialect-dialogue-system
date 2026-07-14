import { useState } from 'react'

function InputArea({ onSend, disabled }) {
  const [text, setText] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (text.trim() && !disabled) {
      onSend(text)
      setText('')
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  return (
    <form className="input-area" onSubmit={handleSubmit}>
      <input
        type="text"
        className="input-field"
        placeholder="输入消息..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
      />
      <button 
        type="submit" 
        className="send-button"
        disabled={disabled || !text.trim()}
      >
        发送
      </button>
    </form>
  )
}

export default InputArea