import type { ReactNode, ReactElement } from 'react'
import ReactMarkdown from 'react-markdown'
import type { Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

// react-markdown v10 no longer passes `inline` to `code`, and no longer passes
// `ordered`/`index` to `li`. Anything relying on those props silently renders
// every inline `code` as a block and every ordered list as bullets, so block
// code is handled in `pre` (which owns the real wrapper) and list numbering is
// left to native list markers.

// Pull the raw text out of a fenced block. `pre` receives the <code> element
// react-markdown built, so the text and the language class both live one level in.
function fencedCode(children: ReactNode): { text: string; lang: string } {
  const el = Array.isArray(children) ? children[0] : children
  const props = (el as ReactElement<{ children?: ReactNode; className?: string }> | undefined)?.props ?? {}
  const text = typeof props.children === 'string'
    ? props.children
    : Array.isArray(props.children) ? props.children.join('') : ''
  const lang = /language-([\w-]+)/.exec(props.className ?? '')?.[1] ?? ''
  return { text: text.replace(/\n$/, ''), lang }
}

const components: Components = {
  h1: ({ children }) => (
    <div className="flex items-center gap-1.5 mb-1 mt-2 first:mt-0">
      <span className="text-pixel-blue/60 text-[9px]">▸</span>
      <span className="font-pixel text-sm text-pixel-cyan tracking-wide">{children}</span>
    </div>
  ),
  h2: ({ children }) => (
    <p className="font-bold text-xs text-pixel-white mb-1 mt-2 first:mt-0">{children}</p>
  ),
  h3: ({ children }) => (
    <p className="font-semibold text-[11px] text-pixel-blue mb-1 mt-1">{children}</p>
  ),
  h4: ({ children }) => (
    <p className="font-semibold text-[11px] text-pixel-blue/80 mb-1 mt-1">{children}</p>
  ),

  p: ({ children }) => (
    <p className="text-[11px] leading-relaxed mb-1 last:mb-0">{children}</p>
  ),

  strong: ({ children }) => (
    <span className="font-bold text-pixel-white">{children}</span>
  ),
  em: ({ children }) => (
    <span className="italic text-pixel-cyan/90">{children}</span>
  ),
  del: ({ children }) => (
    <span className="line-through text-pixel-gray/50">{children}</span>
  ),

  // Inline only: fenced blocks are intercepted by `pre` below.
  code: ({ children }) => (
    <code className="px-1 py-0.5 bg-pixel-blue/10 border border-pixel-blue/20 text-pixel-cyan font-mono text-[10px] break-words">
      {children}
    </code>
  ),

  pre: ({ children }) => {
    const { text, lang } = fencedCode(children)
    return (
      <div className="my-1.5 border border-pixel-blue/20" style={{ background: '#060a14' }}>
        {lang && (
          <div className="px-2 py-0.5 border-b border-pixel-blue/15 font-mono text-[9px] text-pixel-blue/60">
            {lang}
          </div>
        )}
        <pre className="p-2 overflow-x-auto scrollbar-thin">
          <code className="font-mono text-[10px] text-pixel-cyan/90 leading-relaxed whitespace-pre">
            {text}
          </code>
        </pre>
      </div>
    )
  },

  // Native markers so ordered lists actually number and nesting still works.
  ul: ({ children }) => (
    <ul className="my-1 pl-4 space-y-0.5" style={{ listStyleType: '"▸  "' }}>{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="my-1 pl-4 space-y-0.5 list-decimal">{children}</ol>
  ),
  li: ({ children, className }) => {
    // GFM task list: remark marks the <li>, the checkbox is a child <input>.
    const isTask = (className ?? '').includes('task-list-item')
    return (
      <li
        className={`text-[11px] leading-relaxed marker:text-pixel-blue/60 ${isTask ? 'list-none' : ''}`}
      >
        {children}
      </li>
    )
  },
  input: ({ checked }) => (
    <span
      className={`inline-block w-2.5 h-2.5 mr-1.5 align-middle border ${
        checked ? 'bg-pixel-cyan/70 border-pixel-cyan' : 'border-pixel-blue/40'
      }`}
    />
  ),

  blockquote: ({ children }) => (
    <div className="pl-2 border-l-2 border-pixel-cyan/40 text-pixel-gray/70 italic text-[11px] my-1">
      {children}
    </div>
  ),

  hr: () => (
    <div className="my-2 flex items-center gap-2">
      <div className="flex-1 h-px bg-pixel-blue/20" />
      <div className="w-1 h-1 bg-pixel-blue/30" />
      <div className="flex-1 h-px bg-pixel-blue/20" />
    </div>
  ),

  // href is empty when react-markdown rejects an unsafe protocol
  // (javascript:, data:) - render those as plain text instead of a dead link.
  a: ({ href, children }) =>
    href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-pixel-cyan underline underline-offset-2 hover:text-pixel-blue transition-colors break-words"
      >
        {children}
      </a>
    ) : (
      <span className="text-pixel-gray/60">{children}</span>
    ),

  table: ({ children }) => (
    <div className="my-2 overflow-x-auto scrollbar-thin">
      <table className="w-full border-collapse font-mono text-[10px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="px-2 py-1 border border-pixel-blue/20 bg-pixel-blue/10 text-pixel-blue text-left font-bold">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="px-2 py-1 border border-pixel-blue/10 text-pixel-white/80">{children}</td>
  ),
}

interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null
  return (
    <div className={`markdown-chat ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}