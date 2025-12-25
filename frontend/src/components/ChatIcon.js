import React from "react";

function ChatIcon({ onClick, unreadCount = 0 }) {
  return (
    <>
      <style>{iconStyles}</style>
      <button className="chat-icon-button" onClick={onClick}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </button>
    </>
  );
}

const iconStyles = `
  .chat-icon-button {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #4a6cff 0%, #3a5ce5 100%);
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(74, 108, 255, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    z-index: 9998;
  }

  .chat-icon-button:hover {
    transform: scale(1.1) translateY(-2px);
    box-shadow: 0 6px 25px rgba(74, 108, 255, 0.5);
  }

  .chat-icon-button:active {
    transform: scale(0.95);
  }

  .unread-badge {
    position: absolute;
    top: -5px;
    right: -5px;
    background: #ff4757;
    color: white;
    font-size: 0.75rem;
    font-weight: 700;
    padding: 4px 8px;
    border-radius: 12px;
    min-width: 20px;
    text-align: center;
  }

  @media (max-width: 768px) {
    .chat-icon-button {
      bottom: 20px;
      right: 20px;
      width: 56px;
      height: 56px;
    }
  }
`;

export default ChatIcon;
