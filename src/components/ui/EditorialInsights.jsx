import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, Brain, Check, ChevronRight, Lightbulb, X } from 'lucide-react'

const norm = v => String(v || '')
  .toLowerCase()
  .trim()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')

const KEY_TYPES = new Set(['clave', 'key', 'key insight', 'hallazgo clave', 'headline', 'resumen'])
const OBS_TYPES = new Set(['observacion', 'observation', 'observaciones'])
const LEARNING_TYPES = new Set(['aprendizaje', 'learning', 'aprendizajes'])

function isType(item, types) {
  return types.has(norm(item?.tipo))
}

function cleanBullet(text) {
  return String(text || '')
    .split(/\r?\n/)
    .map(s => s.trim())
    .map(s => s.replace(/^(?:[-•*·]|\d+[.)])\s*/, ''))
    .filter(Boolean)
}

function itemBullets(item) {
  return cleanBullet(item?.descripcion || item?.observacion || '')
}


export function mergeLegacyObservations(hallazgos = [], observaciones = []) {
  const base = Array.isArray(hallazgos) ? hallazgos : []
  const legacy = (Array.isArray(observaciones) ? observaciones : []).map((o, i) => ({
    ...o,
    tipo: o.tipo || 'observacion',
    _legacyObservation: true,
    _legacyId: i,
  }))
  return [...base, ...legacy]
}

export function splitEditorialInsights(items = []) {
  const valid = (Array.isArray(items) ? items : [items]).filter(Boolean).filter(item =>
    String(item?.titulo || '').trim() || String(item?.descripcion || item?.observacion || '').trim()
  )

  const key = valid.filter(item => isType(item, KEY_TYPES))
  const observations = valid.filter(item => isType(item, OBS_TYPES))
  const learnings = valid.filter(item => isType(item, LEARNING_TYPES))
  const legacy = valid.filter(item => !KEY_TYPES.has(norm(item?.tipo)) && !OBS_TYPES.has(norm(item?.tipo)) && !LEARNING_TYPES.has(norm(item?.tipo)))

  return { valid, key, observations, learnings, legacy }
}

export function EditorialInsightCard({ items = [], accent = '#facc15', compact = false, className = '' }) {
  const { key, observations, learnings, legacy } = useMemo(() => splitEditorialInsights(items), [items])
  const headline = key[0] || legacy[0] || observations[0] || learnings[0]
  if (!headline) return null

  const bullets = [
    ...key.slice(0, 1).flatMap(item => itemBullets(item)),
    ...observations.flatMap(item => itemBullets(item)),
    ...learnings.flatMap(item => itemBullets(item)),
  ]

  const uniqueBullets = [...new Set(bullets)]

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] ${compact ? 'p-4' : 'p-5'} ${className}`}>
      <div className="absolute -top-20 -right-16 w-40 h-40 rounded-full blur-3xl opacity-15" style={{ background: accent }} />
      <div className="relative">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: `${accent}18`, border: `1px solid ${accent}35` }}>
            <Lightbulb className="w-3.5 h-3.5" style={{ color: accent }} />
          </span>
          <span className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: accent }}>Hallazgo clave</span>
        </div>
        <h3 className={`${compact ? 'text-sm' : 'text-base'} font-semibold font-display text-white leading-snug max-w-3xl`}>
          {headline.titulo || headline.descripcion || headline.observacion}
        </h3>
        {uniqueBullets.length > 0 && (
          <ul className="mt-3 space-y-1.5">
            {uniqueBullets.slice(0, compact ? 4 : 8).map((bullet, i) => (
              <li key={`${bullet}-${i}`} className="flex gap-2 text-xs sm:text-sm text-white/62 leading-relaxed">
                <span className="mt-[0.45rem] w-1 h-1 rounded-full flex-shrink-0" style={{ background: accent }} />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export function PlatformInsightsCard({ items = [], accent = '#facc15', label = 'Hallazgos' }) {
  const [open, setOpen] = useState(false)
  const { key, observations, learnings, legacy } = useMemo(() => splitEditorialInsights(items), [items])
  const headline = key[0] || legacy[0] || observations[0] || learnings[0]
  if (!headline) return null

  const obsBullets = observations.flatMap(itemBullets)
  const learningBullets = learnings.flatMap(itemBullets)
  const fallbackBullets = legacy.slice(1).flatMap(itemBullets)
  const total = obsBullets.length + learningBullets.length + fallbackBullets.length

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035] p-4 sm:p-5">
        <div className="absolute inset-y-0 left-0 w-[2px]" style={{ background: accent }} />
        <div className="flex items-start justify-between gap-4 pl-2">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: accent }}>Hallazgo clave</span>
            </div>
            <p className="text-sm sm:text-[15px] font-semibold font-display text-white leading-snug line-clamp-3">
              {headline.titulo || headline.descripcion || headline.observacion}
            </p>
          </div>
          <button
            onClick={() => setOpen(true)}
            className="flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-[11px] font-semibold border transition-all hover:bg-white/10"
            style={{ color: accent, borderColor: `${accent}35`, background: `${accent}0c` }}
          >
            {label}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {total > 0 && (
          <div className="mt-3 pl-2 flex items-center gap-2 text-[10px] text-white/38">
            <span>{total} {total === 1 ? 'hallazgo' : 'hallazgos'} adicionales</span>
            <span>·</span>
            <span>Observaciones + aprendizajes</span>
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[70] bg-black/65 backdrop-blur-md flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
              transition={{ duration: 0.22 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[82vh] overflow-hidden rounded-2xl border border-white/12 bg-[#111117]/95 shadow-2xl flex flex-col"
            >
              <div className="flex items-start justify-between gap-4 px-5 sm:px-6 py-5 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Brain className="w-4 h-4" style={{ color: accent }} />
                    <span className="text-[10px] uppercase tracking-[0.18em] font-bold" style={{ color: accent }}>{label}</span>
                  </div>
                  <h3 className="text-lg font-semibold font-display text-white">{headline.titulo || 'Análisis del periodo'}</h3>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 rounded-lg hover:bg-white/10 transition-colors">
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>

              <div className="overflow-y-auto p-5 sm:p-6 space-y-6">
                <section>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }} />
                    <h4 className="text-[10px] uppercase tracking-[0.18em] font-bold text-white/45">Hallazgo clave</h4>
                  </div>
                  <div className="rounded-xl border border-white/10 bg-white/[0.025] p-4">
                    <p className="text-sm text-white/85 leading-relaxed">{headline.titulo || headline.descripcion || headline.observacion}</p>
                  </div>
                </section>

                {obsBullets.length > 0 && (
                  <InsightList title="Observaciones" icon={<ArrowUpRight className="w-3.5 h-3.5" />} accent={accent} bullets={obsBullets} />
                )}
                {learningBullets.length > 0 && (
                  <InsightList title="Aprendizajes" icon={<Check className="w-3.5 h-3.5" />} accent={accent} bullets={learningBullets} />
                )}
                {obsBullets.length === 0 && learningBullets.length === 0 && fallbackBullets.length > 0 && (
                  <InsightList title="Hallazgos" icon={<Lightbulb className="w-3.5 h-3.5" />} accent={accent} bullets={fallbackBullets} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function InsightList({ title, icon, accent, bullets }) {
  const clean = [...new Set(bullets)].filter(Boolean)
  if (!clean.length) return null
  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md" style={{ background: `${accent}14`, color: accent }}>
          {icon}
        </span>
        <h4 className="text-[10px] uppercase tracking-[0.18em] font-bold text-white/50">{title}</h4>
      </div>
      <ul className="space-y-2">
        {clean.map((bullet, i) => (
          <li key={`${bullet}-${i}`} className="flex gap-3 rounded-xl border border-white/7 bg-white/[0.018] px-4 py-3 text-sm text-white/68 leading-relaxed">
            <span className="mt-[0.48rem] w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accent }} />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}
