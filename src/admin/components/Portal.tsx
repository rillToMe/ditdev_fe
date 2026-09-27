import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { ReactNode } from 'react'

export default function Portal({ children }: { children: ReactNode }) {
  const [container] = useState(() => {
    const el = document.createElement('div')
    // Carries the admin theme tokens so modals teleported to <body> still
    // resolve every --a-* variable and inherit the admin font.
    el.className = 'admin-portal-root'
    return el
  })

  useEffect(() => {
    document.body.appendChild(container)
    return () => { document.body.removeChild(container) }
  }, [container])

  return createPortal(children, container)
}
