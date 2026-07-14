import React from 'react'
import MessageBubble from './MessageBubble'
import LoadingIndicator from './LoadingIndicator'

function ChatWindow({ messages, isLoading }, ref) {
  return (
    <div className="chat-window" ref={ref}>
      {messages.length === 0 && (
        <div className="empty-state">
          <p>开始对话，体验地道四川方言</p>
          <p className="hint">试试问：成都哪里的火锅好吃？</p>
        </div>
      )}
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      {isLoading && <LoadingIndicator />}
    </div>
  )
}

export default React.forwardRef(ChatWindow)