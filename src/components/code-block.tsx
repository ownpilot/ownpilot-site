'use client';
import { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';
export function CodeBlock({ code, title = 'terminal', compact = false }: { code: string; title?: string; compact?: boolean }) {
  const [status, setStatus] = useState<'idle' | 'copied' | 'failed'>('idle');
  async function copy() {
    try { await navigator.clipboard.writeText(code); setStatus('copied'); } catch { setStatus('failed'); }
    window.setTimeout(() => setStatus('idle'), 3000);
  }
  return <div className={`code-block ${compact ? 'code-compact' : ''}`}><div className="code-heading"><span><Terminal size={14}/>{title}</span><button onClick={copy} aria-label={`Copy ${title}`}><span aria-live="polite">{status === 'copied' ? 'Copied!' : status === 'failed' ? 'Select code to copy' : 'Copy'}</span>{status === 'copied' ? <Check size={15}/> : <Copy size={15}/>}</button></div><pre tabIndex={0} aria-label={`${title} code`}><code>{code.split('\n').map((line, i) => <span className={`code-line ${line.trim().startsWith('#') ? 'code-comment' : ''}`} key={i}>{line || ' '}{'\n'}</span>)}</code></pre></div>;
}
