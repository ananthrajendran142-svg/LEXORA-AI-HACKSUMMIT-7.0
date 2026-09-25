import React from 'react';

interface FormattedMarkdownProps {
  content: string;
  className?: string;
}

export const FormattedMarkdown: React.FC<FormattedMarkdownProps> = ({ content, className = '' }) => {
  if (!content) return null;

  // Clean up any double code block wrappers or trailing backticks
  let text = content.replace(/```text/g, '```').trim();

  // Split content into blocks by code fences first
  const segments = text.split(/(```[\s\S]*?```)/g);

  return (
    <div className={`space-y-3 font-sans text-xs leading-relaxed theme-heading ${className}`}>
      {segments.map((segment, segIdx) => {
        if (segment.startsWith('```') && segment.endsWith('```')) {
          const codeContent = segment.slice(3, -3).replace(/^[\r\n]+/, '').replace(/[\r\n]+$/, '');
          return (
            <div key={segIdx} className="theme-elevated p-3.5 border-l-4 border-amber-500 rounded-r-lg my-2.5 font-serif italic theme-heading text-xs shadow-xs leading-relaxed">
              "{codeContent}"
            </div>
          );
        }

        // Process line-by-line for headings, rules, lists, and inline bold/italic
        const lines = segment.split(/\r?\n/);
        return (
          <div key={segIdx} className="space-y-1.5">
            {lines.map((line, lineIdx) => {
              const trimmed = line.trim();
              if (!trimmed) return null;

              // Horizontal rule
              if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
                return <hr key={lineIdx} className="border-t border-subtle my-3 opacity-60" />;
              }

              // Headings
              if (trimmed.startsWith('### ')) {
                const headingText = trimmed.replace(/^###\s+/, '');
                return (
                  <h3 key={lineIdx} className="text-xs font-serif font-bold text-[var(--primary-accent)] uppercase tracking-wider border-b border-subtle pb-1 mt-3.5 mb-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary-accent)] shrink-0"></span>
                    <span>{renderInlineFormatting(headingText)}</span>
                  </h3>
                );
              }

              if (trimmed.startsWith('## ')) {
                const headingText = trimmed.replace(/^##\s+/, '');
                return (
                  <h2 key={lineIdx} className="text-sm font-serif font-bold theme-heading tracking-tight border-b border-subtle pb-1 mt-4 mb-1.5">
                    {renderInlineFormatting(headingText)}
                  </h2>
                );
              }

              if (trimmed.startsWith('# ')) {
                const headingText = trimmed.replace(/^#\s+/, '');
                return (
                  <h1 key={lineIdx} className="text-base font-serif font-bold theme-heading tracking-tight mt-4 mb-2">
                    {renderInlineFormatting(headingText)}
                  </h1>
                );
              }

              // Bullet lists
              if (/^[-*•]\s+/.test(trimmed)) {
                const bulletText = trimmed.replace(/^[-*•]\s+/, '');
                return (
                  <div key={lineIdx} className="flex items-start gap-2 pl-2 text-xs theme-heading leading-relaxed">
                    <span className="text-[var(--primary-accent)] font-bold shrink-0 mt-0.5">•</span>
                    <span className="flex-1">{renderInlineFormatting(bulletText)}</span>
                  </div>
                );
              }

              // Key-Value bold lines or standard paragraphs
              return (
                <p key={lineIdx} className="text-xs theme-heading leading-relaxed">
                  {renderInlineFormatting(trimmed)}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

// Helper function to render bold (**text**), italic (*text*), and code (`code`) inline
function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold theme-heading">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={idx} className="italic theme-subtext font-serif">
          {part.slice(1, -1)}
        </em>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={idx} className="px-1.5 py-0.5 font-mono text-[11px] theme-elevated border border-subtle rounded text-[var(--primary-accent)]">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default FormattedMarkdown;
