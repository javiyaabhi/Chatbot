import { useEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import {
  BookOpen,
  Check,
  Code2,
  Copy,
  Cpu,
  Database,
  GraduationCap,
  Languages,
  Menu,
  Network,
  Pencil,
  Plus,
  Search,
  Send,
  Sparkles,
  Terminal,
  Trash2,
  Volume2,
  VolumeX,
  WifiOff,
  X,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { api } from './api'
import type { Conversation, Language, TeachingMode, User } from './types'

const languageLabels: Record<Language, string> = {
  en: 'English',
  gu: 'ગુજરાતી',
  hi: 'हिन्दी',
}

const subjectsList = [
  {
    id: 'DBMS',
    name: 'Database Systems',
    short: 'DBMS',
    icon: Database,
    description: 'SQL queries, normalization (1NF-BCNF), ACID, transactions, and indexing.',
    starters: [
      { text: 'Explain 3NF vs BCNF with a student example', lang: 'en' as Language },
      { text: 'નોર્મલાઈઝેશન (1NF, 2NF, 3NF) સરળ ગુજરાતીમાં સમજાવો', lang: 'gu' as Language },
      { text: 'ACID गुणधर्म क्या हैं? बैंक उदाहरण के साथ समझाइए', lang: 'hi' as Language },
      { text: 'Compare B-Tree and B+ Tree indexing with query performance', lang: 'en' as Language },
    ],
  },
  {
    id: 'Operating Systems',
    name: 'Operating Systems',
    short: 'OS',
    icon: Cpu,
    description: 'Process scheduling, deadlocks, paging, virtual memory, and threads.',
    starters: [
      { text: 'Explain Deadlock 4 Coffman conditions and Banker algorithm', lang: 'en' as Language },
      { text: 'વર્ચ્યુઅલ મેમરી અને પેજ ફોલ્ટ કેવી રીતે કામ કરે છે?', lang: 'gu' as Language },
      { text: 'Round Robin और FCFS शेड्यूलिंग का तुलनात्मक विश्लेषण', lang: 'hi' as Language },
      { text: 'Explain Mutex vs Semaphore with critical section code', lang: 'en' as Language },
    ],
  },
  {
    id: 'Computer Networks',
    name: 'Computer Networks',
    short: 'CN',
    icon: Network,
    description: 'OSI 7-layer model, TCP/IP handshake, routing protocols, and subnetting.',
    starters: [
      { text: 'Break down the TCP 3-way handshake step by step', lang: 'en' as Language },
      { text: 'OSI મોડેલના 7 લેયર્સ અને તેમનું કાર્ય વિગતવાર સમજાવો', lang: 'gu' as Language },
      { text: 'DNS रेजोल्यूशन कैसे काम करता है? फ्लो चार्ट के साथ', lang: 'hi' as Language },
      { text: 'Explain IPv4 Subnetting and CIDR calculation with example', lang: 'en' as Language },
    ],
  },
  {
    id: 'DSA',
    name: 'Data Structures & Algorithms',
    short: 'DSA',
    icon: Code2,
    description: 'Trees, dynamic programming, sorting, graph algorithms, and Big-O complexity.',
    starters: [
      { text: 'Explain AVL Tree self-balancing rotations with diagrams', lang: 'en' as Language },
      { text: 'બાયનરી સર્ચ ટ્રી (BST) અને ટાઈમ કોમ્પ્લેક્સિટી સમજાવો', lang: 'gu' as Language },
      { text: 'Dynamic Programming vs Divide and Conquer में क्या अंतर है?', lang: 'hi' as Language },
      { text: 'Compare Dijkstra algorithm and Bellman-Ford shortest path', lang: 'en' as Language },
    ],
  },
]

const teachingModes: { id: TeachingMode; label: string; icon: string; desc: string }[] = [
  { id: 'beginner', label: 'Beginner', icon: '🎓', desc: 'Analogies & simple everyday terms' },
  { id: 'step-by-step', label: 'Step-by-Step', icon: '📐', desc: 'Procedural structured breakdowns' },
  { id: 'intermediate', label: 'Standard', icon: '⚡', desc: 'Technical definitions & models' },
  { id: 'advanced', label: 'Exam Prep', icon: '🔬', desc: 'Formal rigor, edge cases & proofs' },
]

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [checking, setChecking] = useState(true)
  const [sessionError, setSessionError] = useState('')

  useEffect(() => {
    api.guest()
      .then((value) => setUser(value.user))
      .catch((caught) => setSessionError(caught instanceof Error ? caught.message : 'Could not start a guest session.'))
      .finally(() => setChecking(false))
  }, [])

  if (checking) {
    return (
      <main className="loading" role="status" aria-label="Loading EduVaani AI">
        <span className="loading-mark"><GraduationCap size={24} /></span>
        <span className="loading-line" />
      </main>
    )
  }

  if (!user) {
    return (
      <main className="loading session-error">
        <span className="loading-mark"><GraduationCap size={24} /></span>
        <p role="alert">{sessionError}</p>
        <button className="new-chat" onClick={() => window.location.reload()}>Try again</button>
      </main>
    )
  }

  return <TutorApp user={user} />
}

function TutorApp({ user }: { user: User }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [language, setLanguage] = useState<Language>(user.preferredLanguage)
  const [teachingMode, setTeachingMode] = useState<TeachingMode>('beginner')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [historyLoading, setHistoryLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewModal, setShowNewModal] = useState(false)
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const chatBottomRef = useRef<HTMLDivElement>(null)

  async function refresh() {
    setHistoryLoading(true)
    try {
      const result = await api.listConversations()
      setConversations(result.conversations)
      setError('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not load your conversations.')
    } finally {
      setHistoryLoading(false)
    }
  }

  useEffect(() => {
    void refresh()
  }, [])

  useEffect(() => {
    const handleOnline = () => setOffline(false)
    const handleOffline = () => setOffline(true)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!activeId) {
      setConversation(null)
      return
    }
    api.getConversation(activeId)
      .then((result) => {
        setConversation(result.conversation)
        if (result.conversation.language) {
          setLanguage(result.conversation.language)
        }
      })
      .catch((caught) => setError(caught.message))
  }, [activeId])

  useEffect(() => {
    if (conversation?.messages.length) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [conversation?.messages, loading])

  // Stop speech synthesis if conversation changes
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeakingMessageId(null)
  }, [activeId])

  async function createNewConversation(subject: string = 'DBMS', customLanguage?: Language) {
    setLoading(true)
    setError('')
    try {
      const targetLang = customLanguage ?? language
      const result = await api.createConversation({
        language: targetLang,
        subject,
        title: 'New learning conversation',
      })
      setConversations((current) => [result.conversation, ...current])
      setActiveId(result.conversation.id)
      setLanguage(targetLang)
      setMenuOpen(false)
      setShowNewModal(false)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not create a conversation.')
    } finally {
      setLoading(false)
    }
  }

  async function deleteConversation(id: string, e: React.MouseEvent) {
    e.stopPropagation()
    if (!window.confirm('Are you sure you want to delete this conversation?')) return
    try {
      await api.deleteConversation(id)
      setConversations((current) => current.filter((c) => c.id !== id))
      if (activeId === id) {
        setActiveId(null)
        setConversation(null)
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not delete conversation.')
    }
  }

  async function renameConversation(id: string, currentTitle: string, e: React.MouseEvent) {
    e.stopPropagation()
    const nextTitle = window.prompt('Rename conversation:', currentTitle)
    if (!nextTitle || nextTitle.trim() === currentTitle) return
    try {
      const res = await api.updateConversation(id, { title: nextTitle.trim() })
      setConversations((current) =>
        current.map((c) => (c.id === id ? { ...c, title: res.conversation.title } : c))
      )
      if (conversation?.id === id) {
        setConversation((curr) => (curr ? { ...curr, title: res.conversation.title } : null))
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not rename conversation.')
    }
  }

  async function changeLanguage(nextLanguage: Language) {
    setLanguage(nextLanguage)
    if (!activeId) return
    try {
      const result = await api.updateConversationLanguage(activeId, nextLanguage)
      setConversation(result.conversation)
      await refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not change the response language.')
    }
  }

  async function handleSendQuestion(questionText: string) {
    const question = questionText.trim()
    if (!question || loading) return

    let currentActiveId = activeId

    // If no active conversation, create one automatically
    if (!currentActiveId) {
      setLoading(true)
      try {
        const result = await api.createConversation({
          language,
          subject: 'DBMS',
          title: question.slice(0, 50),
        })
        currentActiveId = result.conversation.id
        setActiveId(currentActiveId)
        setConversations((prev) => [result.conversation, ...prev])
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Failed to initialize session.')
        setLoading(false)
        return
      }
    }

    setLoading(true)
    setError('')
    try {
      await api.sendMessage(currentActiveId, { question, teachingMode })
      const updated = await api.getConversation(currentActiveId)
      setConversation(updated.conversation)
      if (textareaRef.current) {
        textareaRef.current.value = ''
      }
      await refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not send the question.')
    } finally {
      setLoading(false)
    }
  }

  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!textareaRef.current) return
    void handleSendQuestion(textareaRef.current.value)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      if (textareaRef.current) {
        void handleSendQuestion(textareaRef.current.value)
      }
    }
  }

  function toggleSpeech(messageId: string, text: string) {
    if (!('speechSynthesis' in window)) {
      setError('Speech synthesis is not supported on this browser.')
      return
    }

    if (speakingMessageId === messageId) {
      window.speechSynthesis.cancel()
      setSpeakingMessageId(null)
      return
    }

    window.speechSynthesis.cancel()
    // Strip markdown formatting for cleaner speech
    const cleanText = text
      .replace(/#+\s+/g, '')
      .replace(/[*_`~]/g, '')
      .replace(/```[\s\S]*?```/g, 'Code example omitted.')
      .slice(0, 1500)

    const utterance = new SpeechSynthesisUtterance(cleanText)
    if (language === 'gu') utterance.lang = 'gu-IN'
    else if (language === 'hi') utterance.lang = 'hi-IN'
    else utterance.lang = 'en-US'

    utterance.onend = () => setSpeakingMessageId(null)
    utterance.onerror = () => setSpeakingMessageId(null)

    setSpeakingMessageId(messageId)
    window.speechSynthesis.speak(utterance)
  }

  const filteredConversations = conversations.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.subject.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const activeSubject = conversation?.subject ?? 'DBMS'

  return (
    <main className="app-shell">
      {/* Mobile Backdrop */}
      {menuOpen && (
        <button
          className="sidebar-overlay-mask"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={menuOpen ? 'sidebar open' : 'sidebar'} aria-label="Main navigation">
        <button
          className="sidebar-close-btn"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        >
          <X size={20} />
        </button>

        <div className="brand">
          <div className="brand-icon">
            <GraduationCap size={22} />
          </div>
          <div className="brand-text">
            <strong>EduVaani AI</strong>
            <span className="brand-badge">Academic Tutor</span>
          </div>
        </div>

        <button
          className="new-chat"
          onClick={() => void createNewConversation('DBMS')}
          disabled={loading}
          aria-label="Start a new conversation"
        >
          <Plus size={18} />
          <span>New Study Session</span>
        </button>

        <nav aria-label="Primary Navigation">
          <button
            className={`nav-item ${activeId ? 'active' : ''}`}
            onClick={() => {
              if (!activeId && conversations.length > 0) {
                setActiveId(conversations[0].id)
              }
              setMenuOpen(false)
            }}
          >
            <div className="nav-item-left">
              <BookOpen size={17} />
              <span>Study Workspace</span>
            </div>
            {conversations.length > 0 && <span className="nav-badge">{conversations.length}</span>}
          </button>
        </nav>

        {/* History Search Bar */}
        <div className="history-search">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search past sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search conversation history"
          />
          {searchQuery && (
            <button
              className="clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Conversations History List */}
        <div className="history-list">
          <div className="history-section-title">Recent Conversations</div>

          {historyLoading && (
            <div className="history-skeleton" aria-label="Loading past conversations">
              <span />
              <span />
              <span />
            </div>
          )}

          {!historyLoading && filteredConversations.length === 0 && (
            <div className="history-empty">
              {searchQuery ? 'No matching conversations' : 'No study sessions yet'}
            </div>
          )}

          {filteredConversations.map((item) => (
            <div
              key={item.id}
              className={`history-item-wrap ${activeId === item.id ? 'active' : ''}`}
            >
              <button
                className="history-item"
                onClick={() => {
                  setActiveId(item.id)
                  setMenuOpen(false)
                }}
              >
                <span className="history-item-title">{item.title}</span>
                <div className="history-item-meta">
                  <span className="history-pill">{item.subject}</span>
                  <span className="history-pill lang">{item.language.toUpperCase()}</span>
                </div>
              </button>

              <div className="history-item-actions">
                <button
                  className="history-action-btn"
                  title="Rename session"
                  onClick={(e) => renameConversation(item.id, item.title, e)}
                  aria-label={`Rename ${item.title}`}
                >
                  <Pencil size={13} />
                </button>
                <button
                  className="history-action-btn delete"
                  title="Delete session"
                  onClick={(e) => deleteConversation(item.id, e)}
                  aria-label={`Delete ${item.title}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* User Profile Badge */}
        <div className="profile" role="group" aria-label="Guest session info">
          <div className="profile-avatar">{user.name.slice(0, 1).toUpperCase()}</div>
          <div className="profile-info">
            <strong>{user.name}</strong>
            <small>Multilingual Scholar</small>
          </div>
        </div>
      </aside>

      {/* Workspace Area */}
      <section className="workspace">
        <header>
          <div className="header-left">
            <button
              className="mobile-menu-trigger"
              aria-label="Open navigation"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(true)}
            >
              <Menu size={20} />
            </button>

            <div className="workspace-title-box">
              <div className="subject-badge">
                <span className="subject-dot" />
                <span>{activeSubject}</span>
              </div>
              {conversation && (
                <span className="conversation-title-text" title={conversation.title}>
                  {conversation.title}
                </span>
              )}
            </div>
          </div>

          <div className="header-right">
            {/* Teaching Mode Segmented Control */}
            <div className="mode-segmented" role="radiogroup" aria-label="Select Teaching Depth">
              {teachingModes.map((mode) => (
                <button
                  key={mode.id}
                  role="radio"
                  aria-checked={teachingMode === mode.id}
                  title={mode.desc}
                  className={`mode-btn ${teachingMode === mode.id ? 'active' : ''}`}
                  onClick={() => setTeachingMode(mode.id)}
                >
                  <span>{mode.icon}</span>
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>

            {/* Language Selector */}
            <div className="language-select-wrapper">
              <Languages size={15} />
              <label htmlFor="language-select" className="sr-only">
                Response Language
              </label>
              <select
                id="language-select"
                value={language}
                onChange={(e) => void changeLanguage(e.target.value as Language)}
              >
                {Object.entries(languageLabels).map(([code, label]) => (
                  <option key={code} value={code}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Chat / Welcome Area */}
        <div className="chat-area">
          {!conversation ? (
            <div className="welcome-container">
              <div className="welcome-badge">
                <Sparkles size={14} />
                <span>Quiet Academic Multilingual AI Tutor</span>
              </div>

              <h1 className="welcome-title">What would you like to understand?</h1>
              <p className="welcome-desc">
                Learn core Computer Science and Engineering subjects in English, Gujarati, or Hindi
                with step-by-step conceptual rigor and real-world clarity.
              </p>

              {/* Subject Catalog Cards */}
              <div className="subject-grid">
                {subjectsList.map((subject) => {
                  const Icon = subject.icon
                  return (
                    <div
                      key={subject.id}
                      className="subject-card"
                      onClick={() => void createNewConversation(subject.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          void createNewConversation(subject.id)
                        }
                      }}
                    >
                      <div className="subject-card-header">
                        <div className="subject-card-icon">
                          <Icon size={18} />
                        </div>
                        <span className="subject-card-badge">{subject.short}</span>
                      </div>
                      <h2 className="subject-card-title">{subject.name}</h2>
                      <p className="subject-card-sample">{subject.description}</p>
                    </div>
                  )
                })}
              </div>

              {/* Curated Prompt Starters */}
              <div className="quick-starters-section">
                <div className="quick-starters-title">Featured High-Yield Inquiries</div>
                <div className="starter-pills-wrap">
                  {subjectsList
                    .flatMap((s) => s.starters)
                    .slice(0, 6)
                    .map((starter, index) => (
                      <button
                        key={index}
                        className="starter-pill"
                        onClick={() => {
                          setLanguage(starter.lang)
                          void handleSendQuestion(starter.text)
                        }}
                      >
                        <Terminal size={13} />
                        <span>{starter.text}</span>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="conversation-thread" aria-live="polite">
              {conversation.messages.map((message) => (
                <article
                  key={message.id}
                  className={`message-bubble-row ${message.role}`}
                >
                  <div className="message-avatar">
                    {message.role === 'assistant' ? <GraduationCap size={19} /> : user.name.slice(0, 1)}
                  </div>

                  <div className="message-card">
                    <div className="message-top-bar">
                      <span className="message-author-name">
                        {message.role === 'assistant' ? 'EduVaani Academic Guide' : user.name}
                      </span>

                      {message.role === 'assistant' && (
                        <div className="message-actions-toolbar">
                          <CopyMessageButton content={message.content} />
                          <button
                            className={`msg-tool-btn ${speakingMessageId === message.id ? 'speaking' : ''}`}
                            onClick={() => toggleSpeech(message.id, message.content)}
                            title={speakingMessageId === message.id ? 'Stop audio' : 'Listen in audio'}
                            aria-label="Read response aloud"
                          >
                            {speakingMessageId === message.id ? (
                              <>
                                <VolumeX size={14} /> <span>Stop</span>
                              </>
                            ) : (
                              <>
                                <Volume2 size={14} /> <span>Listen</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="message-body">
                      {message.role === 'assistant' ? (
                        <div className="markdown">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              table({ ...props }) {
                                return (
                                  <div className="table-wrapper">
                                    <table {...props} />
                                  </div>
                                )
                              },
                              pre({ children, ...props }) {
                                return <CodeBlock {...props}>{children}</CodeBlock>
                              },
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p>{message.content}</p>
                      )}
                    </div>

                    {/* Contextual Follow-up Suggestions on Assistant Messages */}
                    {message.role === 'assistant' && (
                      <div className="follow-up-group">
                        <button
                          className="follow-up-chip"
                          onClick={() => void handleSendQuestion('Can you give a practical example with step-by-step code?')}
                        >
                          <Code2 size={12} />
                          <span>Show practical example</span>
                        </button>
                        <button
                          className="follow-up-chip"
                          onClick={() => void handleSendQuestion('ગુજરાતીમાં વધુ સરળતાથી સમજાવો (Explain in simpler Gujarati)')}
                        >
                          <Languages size={12} />
                          <span>ગુજરાતીમાં સરળ ખુલાસો</span>
                        </button>
                        <button
                          className="follow-up-chip"
                          onClick={() => void handleSendQuestion('Test me with an exam-style multiple-choice quiz question.')}
                        >
                          <Sparkles size={12} />
                          <span>Test with a quiz question</span>
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              ))}

              {!conversation.messages.length && (
                <div className="empty-thread">
                  <div className="empty-thread-icon">
                    <BookOpen size={26} />
                  </div>
                  <h2>Ask your first {activeSubject} question</h2>
                  <p>Try “Explain normalisation with a simple student example.”</p>
                </div>
              )}

              {loading && (
                <div className="message-bubble-row assistant">
                  <div className="message-avatar">
                    <GraduationCap size={19} />
                  </div>
                  <div className="message-card">
                    <div className="thinking-bubble">
                      <div className="thinking-dots">
                        <span />
                        <span />
                        <span />
                      </div>
                      <span>Synthesizing academic explanation...</span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>
          )}
        </div>

        {/* Composer Component */}
        <div className="composer-wrapper">
          <form className="composer" onSubmit={handleFormSubmit}>
            <textarea
              ref={textareaRef}
              rows={2}
              maxLength={4000}
              placeholder={`Ask any ${activeSubject} question in ${languageLabels[language]}...`}
              disabled={loading}
              onKeyDown={handleKeyDown}
              className="composer-textarea"
              aria-label="Type your academic question"
            />

            <div className="composer-bottom-bar">
              <div className="composer-hints">
                <span className="composer-shortcut">Enter ↵</span> to send
                <span className="composer-shortcut">Shift + Enter</span> for new line
              </div>

              <button
                type="submit"
                className="composer-submit-btn"
                disabled={loading}
                aria-label="Send question to EduVaani"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </div>

        {/* Toasts */}
        {error && (
          <div className="toast error" role="alert">
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              style={{ background: 'transparent', border: 0, color: 'inherit' }}
            >
              <X size={14} />
            </button>
          </div>
        )}
        {offline && (
          <div className="toast offline" role="status">
            <WifiOff size={16} />
            <span>You are currently offline. Changes will sync when reconnected.</span>
          </div>
        )}

        {/* New Session Customization Modal */}
        {showNewModal && (
          <NewSessionModal
            initialSubject={activeSubject}
            initialLanguage={language}
            onClose={() => setShowNewModal(false)}
            onCreate={(subject, lang) => {
              void createNewConversation(subject, lang)
            }}
          />
        )}
      </section>
    </main>
  )
}

function CopyMessageButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      className="msg-tool-btn"
      onClick={handleCopy}
      title="Copy explanation to clipboard"
      aria-label="Copy explanation"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span>{copied ? 'Copied' : 'Copy'}</span>
    </button>
  )
}

function CodeBlock({ children }: { children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false)
  const preRef = useRef<HTMLDivElement>(null)

  function copyCode() {
    const codeText = preRef.current?.innerText ?? ''
    navigator.clipboard.writeText(codeText).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="code-block-card">
      <div className="code-block-header">
        <span>Code Snippet</span>
        <button className="code-copy-btn" onClick={copyCode} aria-label="Copy code snippet">
          {copied ? <Check size={13} /> : <Copy size={13} />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div ref={preRef}>
        <pre>{children}</pre>
      </div>
    </div>
  )
}

function NewSessionModal({
  initialSubject,
  initialLanguage,
  onClose,
  onCreate,
}: {
  initialSubject: string
  initialLanguage: Language
  onClose: () => void
  onCreate: (subject: string, language: Language) => void
}) {
  const [subject, setSubject] = useState(initialSubject)
  const [lang, setLang] = useState<Language>(initialLanguage)

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Start New Study Session</h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal-field">
          <label htmlFor="session-subject">Choose Subject</label>
          <select
            id="session-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          >
            {subjectsList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.short})
              </option>
            ))}
            <option value="Computer Science">Other Computer Science Topic</option>
          </select>
        </div>

        <div className="modal-field">
          <label htmlFor="session-language">Instruction Language</label>
          <select
            id="session-language"
            value={lang}
            onChange={(e) => setLang(e.target.value as Language)}
          >
            {Object.entries(languageLabels).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              onCreate(subject, lang)
            }}
          >
            Begin Session
          </button>
        </div>
      </div>
    </div>
  )
}
