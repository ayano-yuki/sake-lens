import React, { useEffect, useMemo, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { scanImage, locateMatches } from './ocr'
import { Camera, ImagePlus, ScanSearch, Settings2, Sparkles, X, RotateCcw, LoaderCircle, Wine } from 'lucide-react'
import { findTerms, glossary } from './glossary'
import Chat from './chat'
import { readPreferences, languages, translate, translateCategory } from './preferences'
import './styles.css'

const DEMO_WORDS = [
  { text: '純米吟醸', bbox: { x0: 286, y0: 172, x1: 530, y1: 232 } },
  { text: '生酒', bbox: { x0: 355, y0: 266, x1: 462, y1: 318 } },
  { text: '精米歩合', bbox: { x0: 263, y0: 414, x1: 436, y1: 449 } },
  { text: '60%', bbox: { x0: 447, y0: 414, x1: 520, y1: 449 } }
]

function demoImage() {
  const canvas = document.createElement('canvas')
  canvas.width = 800; canvas.height = 600
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#d8d0bf'; ctx.fillRect(0, 0, 800, 600)
  ctx.fillStyle = '#243735'; ctx.fillRect(210, 45, 380, 510)
  ctx.fillStyle = '#f4f0e8'; ctx.fillRect(250, 118, 300, 365)
  ctx.textAlign = 'center'; ctx.fillStyle = '#1c2524'
  ctx.font = '700 58px serif'; ctx.fillText('純米吟醸', 400, 220)
  ctx.fillStyle = '#a13e2f'; ctx.font = '700 48px serif'; ctx.fillText('生酒', 400, 305)
  ctx.fillStyle = '#465957'; ctx.font = '28px sans-serif'; ctx.fillText('精米歩合 60%', 400, 444)
  ctx.fillStyle = '#f4f0e8'; ctx.font = '18px sans-serif'; ctx.fillText('SAKE LENS SAMPLE', 400, 525)
  return canvas.toDataURL('image/jpeg', .92)
}

function flattenWords(data) {
  if (data.words?.length) return data.words
  return (data.blocks || []).flatMap(b => b.paragraphs || []).flatMap(p => p.lines || []).flatMap(l => l.words || [])
}

function App() {
  const [image, setImage] = useState(null)
  const [natural, setNatural] = useState({ width: 1, height: 1 })
  const [words, setWords] = useState([])
  const [matches, setMatches] = useState([])
  const [selected, setSelected] = useState(null)
  const [progress, setProgress] = useState(null)
  const [status, setStatus] = useState(null)
  const [model, setModel] = useState('gemma3:4b')
  const [preferences, setPreferences] = useState(readPreferences)
  const [storageError, setStorageError] = useState(false)
  const t = (key, values) => translate(preferences.language, key, values)
  useEffect(() => {
    try { localStorage.setItem('sake-lens.preferences', JSON.stringify(preferences)); setStorageError(false) }
    catch { setStorageError(true) }
  }, [preferences])
  const inputRef = useRef(null)

  const loadFile = file => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = e => { setImage(e.target.result); setWords([]); setMatches([]); setSelected(null); setStatus({ key: 'imageLoaded' }) }
    reader.readAsDataURL(file)
  }

  const useDemo = () => {
    setImage(demoImage()); setWords(DEMO_WORDS); setMatches(locateMatches(DEMO_WORDS)); setStatus({ key: 'sampleDetected' })
  }

  const scan = async () => {
    if (!image || progress !== null) return
    setStatus({ key: 'preparingOcr' }); setProgress(0)
    try {
      const extracted = await scanImage(image, p => { setProgress(p); setStatus({ key: 'scanning' }) })
      const located = locateMatches(extracted)
      setWords(extracted); setMatches(located)
      setStatus(located.length ? { key: 'termsFound', values: { count: located.length } } : { key: 'noTerms' })
    } catch (error) {
      console.error(error); setStatus({ key: 'ocrError' })
    } finally {
      setProgress(null)
    }
  }

  const openTerm = hit => setSelected(hit.entry)

  const overlayItems = useMemo(() => matches.map((m, i) => ({ ...m, key: `${m.entry.term}-${i}`, left: `${(m.bbox.x0 / natural.width) * 100}%`, top: `${(m.bbox.y0 / natural.height) * 100}%`, width: `${((m.bbox.x1 - m.bbox.x0) / natural.width) * 100}%`, height: `${((m.bbox.y1 - m.bbox.y0) / natural.height) * 100}%` })), [matches, natural])

  useEffect(() => () => image?.startsWith('blob:') && URL.revokeObjectURL(image), [image])

  return <div className="app">
    <header><div className="brand"><span className="brand-mark"><Wine size={18}/></span><span>SAKE LENS</span><small>{t('tagline')}</small></div><button className="icon-btn" title={t('settings')} aria-label={t('settings')} onClick={() => document.getElementById('settings').showModal()}><Settings2 size={20}/></button></header>
    <main>
      <section className="workspace">
        <div className="section-title"><div><span className="step">01</span><h1>{t('readLabel')}</h1></div><span className="count">{t('termsCount', { count: matches.length })}</span></div>
        <div className={`viewer ${image ? 'has-image' : ''}`} onDragOver={e => e.preventDefault()} onDrop={e => { e.preventDefault(); loadFile(e.dataTransfer.files[0]) }}>
          {image ? <div className="image-stage"><img src={image} alt="" onLoad={e => setNatural({ width: e.currentTarget.naturalWidth, height: e.currentTarget.naturalHeight })}/>{overlayItems.map(item => <button key={item.key} className="term-pin" style={{ left: item.left, top: item.top, width: item.width, height: item.height }} onClick={() => openTerm(item)} aria-label={t('explainTerm', { term: item.entry.term })}><span>{item.entry.term}</span></button>)}</div> : <div className="empty"><div className="scan-frame"><ScanSearch size={42}/></div><h2>{t('selectLabel')}</h2><p>{t('selectHelp')}</p><button className="primary" onClick={() => inputRef.current.click()}><ImagePlus size={19}/>{t('selectImage')}</button><button className="text-btn" onClick={useDemo}>{t('trySample')}</button></div>}
          {progress !== null && <div className="processing"><LoaderCircle className="spin" size={30}/><strong>{t('analyzing', { progress: Math.round(progress * 100) })}</strong><div className="bar"><i style={{width: `${progress * 100}%`}}/></div></div>}
        </div>
        <input ref={inputRef} hidden type="file" accept="image/*" capture="environment" onChange={e => loadFile(e.target.files[0])}/>
        <div className="actions">{image && <><button className="secondary" onClick={() => inputRef.current.click()}><RotateCcw size={18}/>{t('changeImage')}</button><button className="primary" onClick={scan} disabled={progress !== null}><ScanSearch size={18}/>{t('analyzeTerms')}</button></>}</div>
        <p className="status" aria-live="polite">{status && t(status.key, status.values)}</p>
      </section>
      <aside>
        <div className="aside-head"><span className="step">02</span><h2>{t('foundTerms')}</h2></div>
        {matches.length ? <div className="term-list">{matches.map((hit, i) => <button key={`${hit.entry.term}-${i}`} onClick={() => openTerm(hit)}><span className="category">{translateCategory(preferences.language, hit.entry.category)}</span><strong>{hit.entry.term}</strong><span className="arrow">↗</span></button>)}</div> : <div className="aside-empty"><Sparkles size={25}/><p>{t('emptyTerms').split('\n').map((line, i) => <React.Fragment key={line}>{i > 0 && <br/>}{line}</React.Fragment>)}</p></div>}
        
      </aside>
    </main>

    {selected && <Chat key={`${selected.term}-${preferences.language}-${preferences.drinks}`} term={selected.term} model={model} preferences={preferences} onClose={() => setSelected(null)}/>}

    <dialog id="settings"><form method="dialog"><div className="dialog-head"><div><span>SAKE LENS</span><h2>{t('settings')}</h2></div><button className="icon-btn" aria-label={t('close')}><X size={20}/></button></div><label>{t('chatLanguage')}<select value={preferences.language} onChange={e => setPreferences(p => ({ ...p, language: e.target.value }))}>{languages.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}</select></label><label>{t('familiarDrink')}<textarea rows={3} maxLength={500} placeholder={t('drinkPlaceholder')} value={preferences.drinks} onChange={e => setPreferences(p => ({ ...p, drinks: e.target.value }))}/></label>{storageError && <p role="alert">{t('storageError')}</p>}<label>{t('model')}<input value={model} onChange={e => setModel(e.target.value)}/></label><p className="hint">{t('settingsHint')}</p><button className="primary wide">{t('closeSettings')}</button></form></dialog>
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
