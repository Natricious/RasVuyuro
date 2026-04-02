import { useState } from 'react';
import './ChatButton.css';

export default function ChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Chat panel */}
      <div className={`chat-panel ${open ? 'chat-panel--open' : ''}`} aria-hidden={!open}>
        <div className="chat-panel__header">
          <div className="chat-panel__header-info">
            <div className="chat-panel__avatar">🎬</div>
            <div>
              <p className="chat-panel__name">CineGuide ასისტენტი</p>
              <p className="chat-panel__status">ონლაინ</p>
            </div>
          </div>
          <button className="chat-panel__close" onClick={() => setOpen(false)} aria-label="Close chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="chat-panel__body">
          <div className="chat-panel__message chat-panel__message--bot">
            <p>გამარჯობა! მე ვარ CineGuide ასისტენტი. მითხარი, რა სახის ფილმი გინდა ნახო? 🎬</p>
          </div>
        </div>
        <div className="chat-panel__footer">
          <input
            type="text"
            className="chat-panel__input"
            placeholder="შეიყვანეთ შეტყობინება..."
            aria-label="Chat input"
          />
          <button className="chat-panel__send" aria-label="Send">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating button */}
      <button
        className="chat-fab"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open chat assistant"
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  );
}
