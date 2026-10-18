import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';
export default function NotFound(){return <main id="main" className="container not-found"><Compass size={55} strokeWidth={1}/><span className="eyebrow">404 / A SMALL DETOUR</span><h1>A little off course.</h1><p>This page isn’t on the map. Your next good idea still is.</p><Link className="button button-primary" href="/">Back to home<ArrowLeft size={16}/></Link></main>}
