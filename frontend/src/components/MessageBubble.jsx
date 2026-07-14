function MessageBubble({ message }) {
  const isUser = message.type === 'user'
  
  return (
    <div className={`message-bubble ${isUser ? 'user' : 'system'}`}>
      <div className="message-content">
        {message.content}
      </div>
      <div className="message-meta">
        <span className="message-time">{message.timestamp}</span>
        {!isUser && message.intent && (
          <span className="message-intent">{message.intent}</span>
        )}
      </div>
    </div>
  )
}

export default MessageBubble