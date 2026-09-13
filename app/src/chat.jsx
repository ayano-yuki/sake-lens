import React, { useEffect, useRef, useState } from 'react'
import { X, Send, LoaderCircle, RotateCcw } from 'lucide-react'
import { chatInstruction, translate } from './preferences'

export default function Chat({ term, model, preferences, onClose }) {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const controller = useRef(null)
  const end = useRef(null)
  const t = (key, values) => translate(preferences.language, key, values)
  const familiarDrink = preferences.drinks.trim()
  const initial = [{ role: 'user', content: t(familiarDrink ? 'initialQuestionWithDrink' : 'initialQuestion', { term, drink: familiarDrink }) }]

  async function ask(history) {
    controller.current?.abort()
    const request = new AbortController()
    controller.current = request
    setMessages(history); setBusy(true); setError('')
    const timer = setTimeout(() => request.abort(), 180000)
    try {
      const response = await fetch('/ollama/api/chat', {
        method: 'POST', signal: request.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model, stream: false, messages: [
          { role: 'system', content: chatInstruction(preferences) },
          ...history,
        ] }),
      })
      if (!response.ok) throw new Error(t('connectionError', { status: response.status }))
      const data = await response.json()
      if (!data.message?.content?.trim()) throw new Error(t('emptyAnswer'))
      if (controller.current === request) setMessages([...history, { role: 'assistant', content: data.message.content }])
    } catch (err) {
      if (controller.current === request) setError(err.name === 'AbortError' ? t('timeout') : err.message)
    } finally {
      clearTimeout(timer)
      if (controller.current === request) setBusy(false)
    }
  }
  useEffect(() => {
    ask(initial)
    return () => { const active = controller.current; controller.current = null; active?.abort() }
  }, [])
  useEffect(() => { end.current?.scrollIntoView({ block: 'nearest' }) }, [messages, busy, error])
  useEffect(() => {
    const escape = event => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', escape)
    return () => document.removeEventListener('keydown', escape)
  }, [onClose])

  return <div className="modal-backdrop" onMouseDown={e => e.target === e.currentTarget && onClose()}>
    <article className="term-modal chat-modal" role="dialog" aria-modal="true" aria-labelledby="chat-title">
      <button className="close" onClick={onClose} aria-label={t('close')}><X size={20}/></button>
      <h2 id="chat-title">{term}</h2>
      <div className="chat-history" role="log" aria-live="polite">
        {messages.map((message, index) => <div className={`chat-message ${message.role}`} key={index}><small>{message.role === 'user' ? t('you') : t('appName')}</small><p>{message.content}</p></div>)}
        {busy && <p className="thinking"><LoaderCircle className="spin" size={18}/>{t('thinking')}</p>}
        {error && <div role="alert" className="chat-error"><p>{error}</p><button className="secondary" onClick={() => ask(messages)}><RotateCcw size={16}/>{t('retry')}</button></div>}
        <div ref={end}/>
      </div>
      <form className="chat-compose" onSubmit={e => { e.preventDefault(); if (busy || error || !draft.trim()) return; ask([...messages, { role: 'user', content: draft.trim() }]); setDraft('') }}>
        <textarea autoFocus aria-label={t('questionPlaceholder')} placeholder={t('questionPlaceholder')} value={draft} onChange={e => setDraft(e.target.value)} rows={2}/>
        <button className="primary" title={t('send')} aria-label={t('send')} disabled={busy || !!error || !draft.trim()}><Send size={20}/></button>
      </form>
    </article>
  </div>
}
