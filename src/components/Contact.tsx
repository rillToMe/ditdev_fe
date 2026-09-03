import { useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FiGithub, FiInstagram, FiMail, FiMapPin, FiSend } from 'react-icons/fi'
import { SiTiktok } from 'react-icons/si'
import { contactAPI } from '../services/api'
import type { ContactMessage } from '../types/api'
import type { ReactNode } from 'react'

interface ContactCard {
  icon: ReactNode
  label: string
  value: string
  href: string
  color: string
  borderColor: string
  hoverColor: string
}

const contacts: ContactCard[] = [
  {
    icon: <FiMail />,
    label: 'Email',
    value: 'contact@kyuzenstudio.com',
    href: 'mailto:contact@kyuzenstudio.com',
    color: 'text-pixel-blue',
    borderColor: 'border-pixel-blue/20',
    hoverColor: 'hover:border-pixel-blue/60',
  },
  {
    icon: <FiGithub />,
    label: 'GitHub',
    value: 'rillToMe',
    href: 'https://github.com/rillToMe',
    color: 'text-pixel-white',
    borderColor: 'border-pixel-blue/20',
    hoverColor: 'hover:border-pixel-blue/60',
  },
  {
    icon: <FiInstagram />,
    label: 'Instagram',
    value: '@rill_lyrics',
    href: 'https://www.instagram.com/rill_lyrics/',
    color: 'text-pink-400',
    borderColor: 'border-pink-400/20',
    hoverColor: 'hover:border-pink-400/60',
  },
  {
    icon: <SiTiktok />,
    label: 'TikTok',
    value: '@goodvibes_music28',
    href: 'https://www.tiktok.com/@goodvibes_music28',
    color: 'text-pixel-cyan',
    borderColor: 'border-pixel-cyan/20',
    hoverColor: 'hover:border-pixel-cyan/60',
  },
]

type FormStatus = 'idle' | 'sending' | 'sent' | 'error'

export default function Contact() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 })
  const [form, setForm] = useState<ContactMessage>({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<FormStatus>('idle')
  const [errorMsg, setErrorMsg] = useState('')

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

  const containerVariants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.1 } }
  }
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  }

  return (
    <section id="contact" className="relative py-28 overflow-hidden">
      {/* Top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-pixel-blue/30 to-transparent" />

      {/* Background grid */}
      <div className="absolute inset-0 grid-overlay opacity-30 pointer-events-none" />

      <div ref={ref} className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <p className="section-tag mb-3">// 07. contact</p>
          <h2 className="font-sans font-bold text-4xl md:text-5xl text-pixel-white">
            Start a <span className="gradient-text">New Quest</span>
          </h2>
          <p className="font-mono text-pixel-gray/50 text-sm mt-3">
            Have a project in mind? Let's team up and build something awesome.
          </p>
          <div className="section-divider max-w-xs mt-4" />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Left: Contact info */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
            className="space-y-5"
          >
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
              <FiMapPin className="text-pixel-blue text-sm" />
              <span className="font-mono text-pixel-gray/60 text-sm">Sumatera Barat, Indonesia</span>
            </motion.div>

            {contacts.map(({ icon, label, value, href, color, borderColor, hoverColor }) => (
              <motion.a
                key={label}
                variants={itemVariants}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-4 p-4 border ${borderColor} bg-bg-card/20 ${hoverColor} hover:bg-bg-hover/30 transition-all group`}
                style={{ clipPath: 'polygon(6px 0%, 100% 0%, calc(100% - 6px) 100%, 0% 100%)' }}
              >
                <div className={`text-xl ${color} group-hover:scale-110 transition-transform`}>
                  {icon}
                </div>
                <div>
                  <p className="font-pixel text-[9px] text-pixel-gray/40 mb-0.5">{label}</p>
                  <p className="font-mono text-pixel-white/80 text-sm group-hover:text-pixel-white transition-colors">
                    {value}
                  </p>
                </div>
                <div className="ml-auto text-pixel-gray/20 group-hover:text-pixel-blue/60 transition-colors">
                  <span className="font-mono text-xs">→</span>
                </div>
              </motion.a>
            ))}

            {/* Dialog box decoration */}
            <motion.div variants={itemVariants} className="p-4 border border-pixel-yellow/20 bg-bg-card/20 relative">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 border border-pixel-blue/30 flex items-center justify-center flex-shrink-0 font-pixel text-pixel-blue text-xs">
                  A
                </div>
                <div>
                  <p className="font-pixel text-pixel-yellow text-[8px] mb-1">ADIT says:</p>
                  <p className="font-mono text-pixel-gray/70 text-sm leading-relaxed">
                    "I'm always open to new collaborations, freelance work, or just a friendly chat about games and code!"
                  </p>
                </div>
              </div>
              <div className="absolute bottom-2 right-3 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-pixel-yellow/40 animate-pulse" />
                <span className="font-pixel text-pixel-yellow/30 text-[7px]">PRESS A</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right: Contact Form */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'show' : 'hidden'}
          >
            <motion.form
              variants={itemVariants}
              onSubmit={handleSubmit}
              className="p-6 border border-pixel-blue/15 bg-bg-card/20 space-y-4"
              style={{ clipPath: 'polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px))' }}
            >
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-pixel-blue/10">
                <div className="w-2 h-2 bg-pixel-blue animate-pulse" />
                <span className="font-pixel text-pixel-blue text-[9px]">NEW MESSAGE</span>
              </div>

              {[
                { name: 'name', label: 'Your Name', placeholder: 'Player One', type: 'text' },
                { name: 'email', label: 'Email Address', placeholder: 'player@guild.com', type: 'email' },
              ].map(({ name, label, placeholder, type }) => (
                <motion.div key={name} variants={itemVariants}>
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
                    className="w-full px-4 py-3 bg-bg-primary/60 border border-pixel-blue/20 font-mono text-sm text-pixel-white placeholder-pixel-gray/30 focus:outline-none focus:border-pixel-blue/60 focus:bg-bg-primary transition-all"
                  />
                </motion.div>
              ))}

              <motion.div variants={itemVariants}>
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
                  className="w-full px-4 py-3 bg-bg-primary/60 border border-pixel-blue/20 font-mono text-sm text-pixel-white placeholder-pixel-gray/30 focus:outline-none focus:border-pixel-blue/60 focus:bg-bg-primary transition-all resize-none"
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={status === 'sending' || status === 'sent'}
                  className="w-full btn-pixel btn-pixel-primary flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {status === 'sending' ? (
                    <><span className="animate-spin">⟳</span> Sending...</>
                  ) : status === 'sent' ? (
                    <><span>✓</span> Message Sent!</>
                  ) : (
                    <><FiSend /> Send Message</>
                  )}
                </button>

                {status === 'sent' && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-green-400 text-xs text-center mt-2"
                  >
                    ✓ Quest accepted! I'll respond soon.
                  </motion.p>
                )}

                {status === 'error' && (
                  <motion.p
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="font-mono text-red-400 text-xs text-center mt-2"
                  >
                    ✗ {errorMsg}
                  </motion.p>
                )}
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      </div>
    </section>
  )
}