'use client';
import { useState } from 'react';
import { ArrowRight, Box, Code2, Terminal } from 'lucide-react';
import Link from 'next/link';
import { dockerCommand,sourceCommand,windowsCommand } from '@/lib/site';
import { CodeBlock } from './code-block';
const methods=[{name:'Docker',icon:Box,code:dockerCommand,title:'terminal · macOS / Linux'},{name:'From source',icon:Code2,code:sourceCommand,title:'terminal · source development'},{name:'PowerShell',icon:Terminal,code:windowsCommand,title:'PowerShell · Windows'}];
export function Quickstart(){const [active,setActive]=useState(0);return <div className="quickstart-code"><div className="install-tabs" role="tablist" aria-label="Installation method">{methods.map((m,i)=><button id={`install-tab-${i}`} key={m.name} role="tab" aria-selected={i===active} aria-controls="install-panel" tabIndex={i===active?0:-1} onClick={()=>setActive(i)} onKeyDown={e=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?2:(i+(e.key==='ArrowLeft'?2:1))%3;setActive(next);document.getElementById(`install-tab-${next}`)?.focus();}}}><m.icon size={14}/>{m.name}</button>)}</div><div role="tabpanel" id="install-panel" aria-labelledby={`install-tab-${active}`}><CodeBlock code={methods[active].code} title={methods[active].title}/></div><div className="quickstart-note"><span>Next: open <code>{active===1?'localhost:8199':'localhost:8080'}</code></span><Link href="/docs/getting-started/">Full setup guide<ArrowRight size={13}/></Link></div></div>}
