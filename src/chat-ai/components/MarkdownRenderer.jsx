import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const components = {
  // Heading
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

  // Paragraph
  p: ({ children }) => (
    <p className="text-[11px] leading-relaxed mb-1 last:mb-0">{children}</p>
  ),

  // Bold & italic
  strong: ({ children }) => (
    <span className="font-bold text-pixel-white">{children}</span>
  ),
  em: ({ children }) => (
    <span className="italic text-pixel-cyan/90">{children}</span>
  ),

  // Inline code
  code: ({ inline, children }) =>
    inline ? (
      <code className="px-1 py-0.5 bg-pixel-blue/10 border border-pixel-blue/20 text-pixel-cyan font-mono text-[10px]">
        {children}
      </code>
    ) : (
      <pre className="my-1.5 p-2 bg-bg-primary/80 border border-pixel-blue/20 overflow-x-auto">
        <code className="font-mono text-[10px] text-pixel-cyan/90 leading-relaxed">{children}</code>
      </pre>
    ),

  // Unordered list
  ul: ({ children }) => (
    <ul className="space-y-0.5 my-1">{children}</ul>
  ),
  // Ordered list
  ol: ({ children }) => (
    <ol className="space-y-0.5 my-1">{children}</ol>
  ),
  li: ({ children, ordered, index }) => (
    <li className="flex items-start gap-1.5 text-[11px] leading-relaxed">
      <span className="text-pixel-blue/60 flex-shrink-0 mt-0.5 text-[10px]">▸</span>
      <span>{children}</span>
    </li>
  ),

  // Blockquote
  blockquote: ({ children }) => (
    <div className="pl-2 border-l-2 border-pixel-cyan/40 text-pixel-gray/70 italic text-[11px] my-1">
      {children}
    </div>
  ),

  // Horizontal rule
  hr: () => (
    <div className="my-2 flex items-center gap-2">
      <div className="flex-1 h-px bg-pixel-blue/20" />
      <div className="w-1 h-1 bg-pixel-blue/30" />
      <div className="flex-1 h-px bg-pixel-blue/20" />
    </div>
  ),

  // Link
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-pixel-cyan underline underline-offset-2 hover:text-pixel-blue transition-colors"
    >
      {children}
    </a>
  ),

  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
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
};

export default function MarkdownRenderer({ content, className = '' }) {
  if (!content) return null;
  return (
    <div className={`markdown-chat ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}