import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { SiGithub, SiTiktok, SiInstagram, SiGmail } from 'react-icons/si'
import type { IconType } from 'react-icons'
import ZoneHeader from './systems/ZoneHeader'
import PixelIcon from './systems/PixelIcon'
import PixelButton from './systems/PixelButton'
import { contactAPI } from '../services/api'
import { SOCIALS, SITE } from '../data/site'
import type { SocialId } from '../data/site'
import { useTypewriter } from '../hooks/useTypewriter'
import { assemble, stagger, scan } from '../lib/motion'
import type { ContactMessage } from '../types/api'

type FormStatus = 'idle' | 'sending' | 'sent' | 'error'

const PROMPTS = [
  'A new quest appeared. Accept?',
  'Speak, traveler. The guild is listening.',
  'Your message will reach the realm.',
]

/** Each social is a party member: real platform name, app icon and a standing. */
const ROSTER: Record<SocialId, { label: string; icon: IconType; level: number }> = {
  github:    { label: 'GITHUB',    icon: SiGithub,    level: 99 },
  tiktok:    { label: 'TIKTOK',    icon: SiTiktok,    level: 42 },
  instagram: { label: 'INSTAGRAM', icon: SiInstagram, level: 37 },
}

export default function Contact() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.08 })
  const [form, setForm] = useState<ContactMessage>({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const prompt = useTypewriter(PROMPTS, 45, 22, 2400)

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMsg('')
    try {
      await contactAPI.send(form)
      setStatus('sent')
      setForm({ name: '', email: '', message: '' })
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Failed to send. Please try again.'
      setErrorMsg(msg)
      setStatus('error')
    }
  }

  return (
    <section id="contact" className="relative py-28 overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pixel-blue/30 to-transparent" />
      <div className="absolute inset-0 grid-faint opacity-40 pointer-events-none" />

      <div ref={ref} className="max-w-6xl mx-auto px-6">
        <ZoneHeader
          variant="banner"
          index="08"
          tag="NPC DIALOGUE"
          title="Start a"
          accent="New Quest"
          icon="mail"
          subtitle="Have a project in mind? Team up and build something."
        />

        <div className="grid md:grid-cols-2 gap-10">
          {/* Left: party roster */}
          <motion.div variants={stagger(0.09)} initial="hidden" animate={inView ? 'show' : 'hidden'} className="space-y-4">
            {/* NPC dialogue window */}
            <div className="relative">
              {/* name plate straddling the top border — sibling of the clipped box so scan's clipPath can't cut it */}
              <motion.span variants={assemble} className="absolute -top-2.5 left-4 z-10 px-2 py-0.5 bg-bg-primary border border-pixel-yellow/30 font-pixel text-pixel-yellow text-[8px] tracking-widest">
                ADIT · LV.99
              </motion.span>
              <motion.div variants={scan}>
                <div
                  className="relative border border-pixel-yellow/25 bg-bg-card/25 p-4 pt-5"
                  style={{ clipPath: 'polygon(8px 0%, 100% 0%, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0% 100%, 0% 8px)' }}
                >
                  <div className="flex items-start gap-3">
                  {/* portrait slot */}
                  <div className="relative w-12 h-12 border border-pixel-blue/40 bg-bg-primary/60 flex items-center justify-center shrink-0">
                    <span className="font-pixel text-pixel-blue text-[10px]">RA</span>
                    <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-400 border border-bg-primary" />
                  </div>

                  <div className="min-w-0">
                    <p className="font-pixel text-pixel-cyan/60 text-[7px] mb-1.5 tracking-widest">GUILDMASTER</p>
                    <p className="font-mono text-pixel-gray/80 text-sm leading-relaxed min-h-[2.5rem]">
                      {prompt}
                      <span className="inline-block w-0.5 h-4 bg-pixel-yellow/70 ml-0.5 align-middle animate-blink" />
                    </p>
                  </div>
                </div>

                  <div className="absolute bottom-2 right-3 flex items-center gap-1.5">
                    <span className="font-pixel text-[7px] text-pixel-yellow/30 tracking-widest">CONTINUE</span>
                    <PixelIcon name="chevronDown" size={9} className="text-pixel-yellow/40 animate-bounce" />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Party header */}
            <motion.div variants={assemble} className="flex items-center gap-2 px-1 pt-1">
              <PixelIcon name="flag" size={12} className="text-pixel-cyan/60" />
              <span className="font-pixel text-[8px] text-pixel-gray/40 tracking-widest">PARTY ROSTER</span>
              <span className="ml-auto font-mono text-[10px] text-pixel-gray/30">{SOCIALS.length} / 3 ACTIVE</span>
            </motion.div>

            {/* Roster cards */}
            {SOCIALS.map(s => {
              const r = ROSTER[s.id]
              return (
                <motion.a
                  key={s.id}
                  variants={assemble}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-4 p-3.5 border border-pixel-blue/20 bg-bg-card/20 hover:border-pixel-cyan/50 hover:bg-bg-hover/30 transition-colors"
                  style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
                >
                  <span className="w-10 h-10 flex items-center justify-center border border-pixel-blue/30 text-pixel-cyan/80 shrink-0 group-hover:border-pixel-cyan/60 transition-colors">
                    <r.icon size={17} />
                  </span>
                  <div className="min-w-0">
                    <p className="font-pixel text-[8px] text-pixel-gray/40 mb-1 tracking-widest">{r.label}</p>
                    <p className="font-mono text-pixel-white/80 text-sm group-hover:text-pixel-white transition-colors truncate">
                      {s.value}
                    </p>
                  </div>
                  <div className="ml-auto text-right shrink-0">
                    <p className="font-mono text-[10px] text-pixel-gray/40">LV.{r.level}</p>
                    <p className="flex items-center justify-end gap-1 font-mono text-[9px] text-green-400/70">
                      <span className="w-1.5 h-1.5 bg-green-400 animate-pulse" />ONLINE
                    </p>
                  </div>
                  <span className="font-mono text-pixel-cyan text-xs opacity-0 group-hover:opacity-100 transition-opacity shrink-0">▶</span>
                </motion.a>
              )
            })}

            {/* Email — the direct channel */}
            <motion.a
              variants={assemble}
              href={`mailto:${SITE.email}`}
              className="group flex items-center gap-4 p-3.5 border border-pixel-cyan/30 bg-pixel-cyan/5 hover:border-pixel-cyan/60 transition-colors"
              style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
            >
              <span className="w-10 h-10 flex items-center justify-center border border-pixel-cyan/40 text-pixel-cyan shrink-0">
                <SiGmail size={16} />
              </span>
              <div className="min-w-0">
                <p className="font-pixel text-[8px] text-pixel-cyan/60 mb-1 tracking-widest">DIRECT · PRIORITY</p>
                <p className="font-mono text-pixel-white text-sm truncate">{SITE.email}</p>
              </div>
              <span className="font-mono text-pixel-cyan text-xs opacity-0 group-hover:opacity-100 transition-opacity ml-auto shrink-0">▶</span>
            </motion.a>
          </motion.div>

          {/* Right: quest contract */}
          <motion.form
            variants={stagger(0.08)}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            onSubmit={handleSubmit}
            className="relative p-6 border border-pixel-blue/15 bg-bg-card/20 space-y-4 self-start"
            style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
          >
            <motion.div variants={assemble} className="flex items-center gap-2 mb-2 pb-4 border-b border-pixel-blue/10">
              <PixelIcon name="scroll" size={13} className="text-pixel-blue" />
              <span className="font-pixel text-pixel-blue text-[9px] tracking-widest">QUEST BRIEF</span>
              <span className="ml-auto font-mono text-[10px] text-pixel-gray/30">CONTRACT №08</span>
            </motion.div>

            {/* Objective + reward readout */}
            <motion.div variants={assemble} className="space-y-1.5 font-mono text-[11px] leading-relaxed text-pixel-gray/50">
              <p>
                <span className="text-pixel-cyan/70">OBJECTIVE</span>
                <span className="text-pixel-gray/30"> — </span>
                Register with the guild so I can reply.
              </p>
              <p>
                <span className="text-pixel-yellow/70">REWARD</span>
                <span className="text-pixel-gray/30"> — </span>
                1 reply, delivered by raven.
              </p>
            </motion.div>

            {[
              { name: 'name',  label: 'Your Name',     placeholder: 'Player One',       type: 'text'  },
              { name: 'email', label: 'Email Address', placeholder: 'player@guild.com', type: 'email' },
            ].map(({ name, label, placeholder, type }) => (
              <motion.div key={name} variants={assemble}>
                <label className="block font-mono text-pixel-gray/50 text-xs mb-1.5">
                  <span className="text-pixel-blue mr-1">›</span>{label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={form[name as keyof ContactMessage]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  required
                  className="w-full px-4 py-3 bg-bg-primary/60 border border-pixel-blue/20 font-mono text-sm text-pixel-white placeholder-pixel-gray/30 focus:outline-none focus:border-pixel-cyan/60 focus:bg-bg-primary transition-colors"
                />
              </motion.div>
            ))}

            <motion.div variants={assemble}>
              <label className="block font-mono text-pixel-gray/50 text-xs mb-1.5">
                <span className="text-pixel-blue mr-1">›</span>Message
              </label>
              <textarea
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Describe your quest..."
                required
                rows={4}
                className="w-full px-4 py-3 bg-bg-primary/60 border border-pixel-blue/20 font-mono text-sm text-pixel-white placeholder-pixel-gray/30 focus:outline-none focus:border-pixel-cyan/60 focus:bg-bg-primary transition-colors resize-none"
              />
            </motion.div>

            <motion.div variants={assemble}>
              <PixelButton
                type="submit"
                variant="primary"
                icon="mail"
                cursor
                disabled={status === 'sending' || status === 'sent'}
                className="w-full justify-center"
              >
                {status === 'sending' ? 'SENDING…' : status === 'sent' ? 'QUEST ACCEPTED' : 'SEND MESSAGE'}
              </PixelButton>

              <p className="text-center font-mono text-[10px] text-pixel-gray/25 mt-2 tracking-widest">
                [ENTER] TO SUBMIT
              </p>

              {status === 'sent' && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-1.5 font-mono text-green-400 text-xs mt-3"
                >
                  <PixelIcon name="check" size={12} />
                  Quest accepted! I'll respond soon.
                </motion.p>
              )}

              {status === 'error' && (
                <motion.p
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center gap-1.5 font-mono text-red-400 text-xs mt-3"
                >
                  <PixelIcon name="close" size={12} />
                  {errorMsg}
                </motion.p>
              )}
            </motion.div>
          </motion.form>
        </div>
      </div>
    </section>
  )
}
