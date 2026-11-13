import React, { useEffect, useRef, useState } from 'react';
import {
  AtSign, Check, Heart, MessageCircle, MoreHorizontal, Moon,
  Paperclip, Plus, Send, Smile, Sparkles, Sun, X
} from 'lucide-react';

const PEOPLE = ['Alan', 'Bob', 'Carol', 'Dean', 'Elin'];

const COLORS = {
  Alan: 'coral',
  Bob: 'blue',
  Carol: 'violet',
  Dean: 'green',
  Elin: 'amber'
};

const EMOJIS = [
  '😀', '😂', '🥹', '😍', '🤝', '🙌', '🔥', '✨',
  '💡', '🚀', '🎯', '❤️', '👏', '👀', '☕', '💬'
];

const initialMessages = [
  { id: 1, name: 'Carol', text: 'Morning, everyone! I pulled together the first pass of the new product direction. Feeling really good about where this is heading.', time: '09:41', likes: 3 },
  { id: 2, name: 'Alan', text: 'Just went through it — the visual hierarchy is much clearer. The little details are doing a lot of work here. ✨', time: '09:44', likes: 2 },
  { id: 3, name: 'Elin', text: 'Agreed. The direction feels considered without getting in the way. I especially like how the empty states are handled.', time: '09:47', likes: 1 },
  { id: 4, name: 'Bob', text: 'This is the kind of polish that makes a product feel effortless. Nice work, team. 🚀', time: '09:52', likes: 4 },
  { id: 5, name: 'Dean', text: 'I can take the interaction states from here. Let’s make sure keyboard navigation gets the same love as the visuals.', time: '09:56', likes: 0 }
];

function Avatar({ name, size = 'normal' }) {
  return (
    <div className={`avatar ${COLORS[name] || 'blue'} ${size}`} aria-label={`${name}'s avatar`}>
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function formatTime(date) {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

function Message({ message, onLike }) {
  return (
    <article className="message-row">
      <Avatar name={message.name} />
      <div className="message-content">
        <div className="message-heading">
          <strong>{message.name}</strong>
          <span>{message.time}</span>
          {message.isNew && <span className="just-now">JUST NOW</span>}
        </div>

        <div className="bubble">
          {message.text.split(/(@(?:Alan|Bob|Carol|Dean|Elin))/g).map((part, i) =>
            part.startsWith('@')
              ? <span className="mention" key={i}>{part}</span>
              : part
          )}
        </div>

        <div className="message-actions">
          <button
            className={`message-like ${message.likedByMe ? 'liked' : ''}`}
            onClick={() => onLike(message.id)}
            aria-label={`Like message from ${message.name}`}
            aria-pressed={!!message.likedByMe}
          >
            <Heart size={13} fill={message.likedByMe ? 'currentColor' : 'none'} />
            <span>{message.likes}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

export default function App() {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [sentCount, setSentCount] = useState(0);
  const [toast, setToast] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const listRef = useRef(null);
  const inputRef = useRef(null);

  // Premium cursor spotlight tracking
  useEffect(() => {
    const app = document.querySelector('.chat-app');
    if (!app) return;

    const handlePointerMove = event => {
      app.style.setProperty('--mx', `${event.clientX}px`);
      app.style.setProperty('--my', `${event.clientY}px`);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
    };
  }, []);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages.length]);

  const showToast = (message) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const sendMessage = () => {
    const text = draft.trim();
    if (!text) return;

    const name = PEOPLE[Math.floor(Math.random() * PEOPLE.length)];

    setMessages(old => [
      ...old,
      {
        id: Date.now(),
        name,
        text,
        time: formatTime(new Date()),
        likes: 0,
        isNew: true
      }
    ]);

    setDraft('');
    setMentionOpen(false);
    setEmojiOpen(false);
    setSentCount(count => count + 1);
    inputRef.current?.focus();
  };

  const handleDraft = value => {
    setDraft(value);

    const match = value.match(/(?:^|\s)@([a-zA-Z]*)$/);

    if (match) {
      setMentionQuery(match[1].toLowerCase());
      setMentionOpen(true);
    } else {
      setMentionOpen(false);
    }
  };

  const insertMention = name => {
    const next = draft.replace(
      /(?:^|\s)@[a-zA-Z]*$/,
      match => `${match.startsWith(' ') ? ' ' : ''}@${name} `
    );

    setDraft(next);
    setMentionOpen(false);
    inputRef.current?.focus();
  };

  const toggleLike = id => {
    setMessages(old =>
      old.map(message => {
        if (message.id !== id) return message;

        const liked = !message.likedByMe;

        return {
          ...message,
          likedByMe: liked,
          likes: Math.max(0, message.likes + (liked ? 1 : -1))
        };
      })
    );
  };

  const addEmoji = emoji => {
    setDraft(value => `${value}${emoji}`);
    setEmojiOpen(false);
    inputRef.current?.focus();
  };

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText('Join the Commonroom conversation.');
      showToast('Invite copied');
    } catch {
      showToast('Ready to invite your team');
    }
  };

  const suggestions = PEOPLE.filter(person =>
    person.toLowerCase().startsWith(mentionQuery)
  );

  return (
    <div className={`chat-app ${darkMode ? 'dark-mode' : 'light-mode'}`}>
      <header className="chat-topbar">
        <a href="#home" className="chat-brand">
          <span className="brand-symbol">
            <MessageCircle size={18} fill="currentColor" />
          </span>
          <span>commonroom<span className="brand-period">.</span></span>
        </a>

        <div className="topbar-center">
          <span className="workspace-dot" />
          DESIGN STUDIO <span className="topbar-slash">/</span> GENERAL
        </div>

        <div className="topbar-right">
          <div className="presence"><i /> 5 MEMBERS ONLINE</div>

          <button
            className="theme-toggle"
            onClick={() => setDarkMode(value => !value)}
            aria-label={darkMode ? 'Switch to bright mode' : 'Switch to dark mode'}
            title={darkMode ? 'Bright mode' : 'Dark mode'}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button className="invite-button" onClick={copyInvite}>
            <Plus size={14} /> Invite
          </button>

          <div className="profile-wrapper">
            <button
              className="profile-control"
              onClick={() => setProfileOpen(value => !value)}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              title="Your profile"
            >
              <span className="profile-symbol">
                <span className="profile-head" />
                <span className="profile-body" />
              </span>
            </button>

            {profileOpen && (
              <div className="profile-menu">
                <div className="profile-menu-heading">
                  <span className="profile-menu-avatar">U</span>
                  <div>
                    <strong>Chat member</strong>
                    <small>Commonroom workspace</small>
                  </div>
                </div>

                <div className="profile-menu-divider" />

                <button
                  className="profile-menu-item"
                  onClick={() => {
                    setDarkMode(value => !value);
                    setProfileOpen(false);
                  }}
                >
                  <span>Appearance</span>
                  <small>{darkMode ? 'Dark mode' : 'Light mode'}</small>
                </button>

                <button
                  className="profile-menu-item"
                  onClick={() => setProfileOpen(false)}
                >
                  <span>Close menu</span>
                  <small>×</small>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="chat-main" id="home">
        <section className="conversation-header">
          <div>
            <div className="channel-eyebrow">
              <span>#</span> TEAM SPACE
            </div>
            <h1>Good things <em>happen here.</em></h1>
            <p>A little corner of the internet for big ideas and better teamwork.</p>
          </div>

          <div className="header-meta">
            <div className="member-stack">
              {['Carol', 'Alan', 'Elin', 'Bob', 'Dean'].map(name =>
                <Avatar key={name} name={name} size="tiny" />
              )}
            </div>
            <span>5 people</span>
            <button className="more-button" aria-label="More conversation options">
              <MoreHorizontal size={19} />
            </button>
          </div>
        </section>

        <section className="conversation-panel">
          <div className="conversation-toolbar">
            <div className="toolbar-left">
              <span className="channel-hash">#</span>
              <strong>general</strong>
              <span className="toolbar-divider" />
              <span className="toolbar-subtitle">The place for everything</span>
            </div>

            <div className="toolbar-right">
              <span><i /> ACTIVE NOW</span>
              <button aria-label="Conversation options">
                <MoreHorizontal size={18} />
              </button>
            </div>
          </div>

          <div
            className="message-scroll"
            ref={listRef}
            role="log"
            aria-label="Message thread"
            aria-live="polite"
          >
            <div className="date-divider">
              <span />
              <label>TODAY · MONDAY, NOVEMBER 12</label>
              <span />
            </div>

            <div className="welcome-note">
              <div className="welcome-icon"><Sparkles size={16} /></div>
              <div>
                <strong>Welcome to the room.</strong>
                <span>Good conversations start with a hello. Jump in whenever you're ready.</span>
              </div>
            </div>

            {messages.map(message => (
              <Message key={message.id} message={message} onLike={toggleLike} />
            ))}

            <div className="typing-note">
              <span className="typing-dots"><i /><i /><i /></span>
              <span>Someone might be typing...</span>
            </div>
          </div>

          <div className="composer-area">
            <div className="composer-hint">
              <span>Enter</span> to send
              <span className="hint-dot">·</span>
              <span>Shift + Enter</span> for a new line
            </div>

            <div className="composer-wrap">
              <div className="composer-tools">
                <button
                  className="tool-button attach"
                  aria-label="Attach file"
                  onClick={() => showToast('File attachments are not part of this demo')}
                >
                  <Paperclip size={17} />
                </button>

                <button
                  className={`tool-button ${mentionOpen ? 'tool-active' : ''}`}
                  aria-label="Mention someone"
                  onClick={() => {
                    setDraft(value => `${value}@`);
                    setMentionOpen(true);
                    inputRef.current?.focus();
                  }}
                >
                  <AtSign size={17} />
                </button>
              </div>

              <textarea
                ref={inputRef}
                value={draft}
                maxLength={500}
                onChange={event => handleDraft(event.target.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }

                  if (event.key === 'Escape') {
                    setMentionOpen(false);
                    setEmojiOpen(false);
                  }
                }}
                placeholder="Write something worth sharing..."
                rows={1}
                aria-label="Write a message"
              />

              <div className="composer-end">
                <div className="emoji-wrap">
                  <button
                    className={`tool-button ${emojiOpen ? 'tool-active' : ''}`}
                    aria-label="Choose emoji"
                    aria-expanded={emojiOpen}
                    onClick={() => {
                      setEmojiOpen(value => !value);
                      setMentionOpen(false);
                    }}
                  >
                    <Smile size={18} />
                  </button>

                  {emojiOpen && (
                    <div className="emoji-popover">
                      <div className="popover-heading">
                        A LITTLE EXPRESSION
                        <button onClick={() => setEmojiOpen(false)} aria-label="Close emoji picker">
                          <X size={13} />
                        </button>
                      </div>
                      <div className="emoji-grid">
                        {EMOJIS.map(emoji => (
                          <button key={emoji} onClick={() => addEmoji(emoji)}>
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <button className="send-button" onClick={sendMessage} disabled={!draft.trim()}>
                  <span>Send</span><Send size={15} />
                </button>
              </div>

              {mentionOpen && suggestions.length > 0 && (
                <div className="mention-popover">
                  <div className="popover-heading">MENTION A TEAMMATE</div>
                  {suggestions.map(name => (
                    <button key={name} onClick={() => insertMention(name)}>
                      <Avatar name={name} size="tiny" />
                      <span>{name}</span>
                      <small>TEAM MEMBER</small>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="composer-footer">
              <span><span className="secure-dot" /> Your messages stay in this room</span>
              <span>{draft.length}/500</span>
            </div>
          </div>
        </section>

        <footer className="chat-footer">
          <span>BUILT ON GOOD ENERGY <span>✳</span></span>
          <span>COMMONROOM · A SPACE TO CONNECT</span>
          <a href="#home">BACK TO TOP ↑</a>
        </footer>
      </main>

      {toast && <div className="toast"><Check size={15} />{toast}</div>}
    </div>
  );
}
