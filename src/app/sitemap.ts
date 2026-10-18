import type {MetadataRoute} from 'next';
import {docs} from '@/lib/docs';
export const dynamic='force-static';
export default function sitemap():MetadataRoute.Sitemap{return ['','integrations/','changelog/','brand/',...Object.keys(docs).map(s=>`docs/${s}/`)].map(path=>({url:`https://ownpilot.dev/${path}`,changeFrequency:path.startsWith('docs/')?'monthly':'weekly',priority:path===''?1:.7}))}
