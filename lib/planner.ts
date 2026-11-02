import { z } from 'zod';
export const categories=['Work','Personal','Learning','Health'] as const;
export const priorities=['High','Medium','Low'] as const;
export const dateSchema=z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>!Number.isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s,'Invalid date');
export const taskInput=z.object({title:z.string().trim().min(1).max(240),category:z.enum(categories),priority:z.enum(priorities),minutes:z.number().int().min(5).max(480),due:dateSchema.nullable(),reason:z.string().max(500).default('Added manually')});
export type Draft=z.infer<typeof taskInput>;
export type Task=Draft & {id:string;completed:boolean;scheduledDate:string|null;start:number|null;createdAt:string};
export const preferences=z.object({start:z.number().int().min(0).max(1380),end:z.number().int().min(60).max(1440),breakMinutes:z.number().int().min(0).max(60)}).refine(p=>p.end>p.start,'End time must be after start time');
export function localDate(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
export function addDays(date:string,n:number){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+n);return localDate(d);}
export function score(t:Draft,date:string){return ({High:300,Medium:200,Low:100}[t.priority])+(t.due&&t.due<date?1000:t.due===date?500:0);}
export function makeSchedule(items:Task[],date:string,p:{start:number;end:number;breakMinutes:number},earliest=0){
 let cursor=Math.max(p.start,earliest);const scheduled:{id:string;start:number}[]=[],overflow:string[]=[];
 const eligible=items.filter(t=>!t.completed&&(!t.due||t.due<=date)).sort((a,b)=>score(b,date)-score(a,date)||(a.due||'9999').localeCompare(b.due||'9999')||a.createdAt.localeCompare(b.createdAt));
 for(const t of eligible){if(cursor<780&&cursor+t.minutes>720)cursor=780;if(cursor+t.minutes>p.end){overflow.push(t.id);continue;}scheduled.push({id:t.id,start:cursor});cursor+=t.minutes+p.breakMinutes;}
 return {scheduled,overflow};
}
export function basicParse(text:string,today:string):Draft[]{
 return text.split(/\n|;/).map(s=>s.trim()).filter(Boolean).slice(0,12).map(raw=>{
 const lower=raw.toLowerCase();let due:string|null=null;
 const iso=raw.match(/\b\d{4}-\d{2}-\d{2}\b/);if(iso&&dateSchema.safeParse(iso[0]).success)due=iso[0];
 else if(/\btomorrow\b/.test(lower))due=addDays(today,1);else if(/\btoday\b|\btonight\b/.test(lower))due=today;
 else{const names=['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];const i=names.findIndex(x=>lower.includes(x));if(i>=0){let delta=(i-new Date(today+'T12:00:00').getDay()+7)%7;if(lower.includes('next ')&&delta===0)delta=7;due=addDays(today,delta);}}
 const category=/\b(gym|run|workout|yoga|doctor|walk|exercise)\b/.test(lower)?'Health':/\b(study|read|course|learn|tutorial|practice)\b/.test(lower)?'Learning':/\b(groceries|laundry|buy|clean|birthday|dentist|rent)\b/.test(lower)?'Personal':'Work';
 const duration=lower.match(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|h|minutes?|mins?|m)\b/);
 const minutes=duration?Math.max(5,Math.min(480,Math.round(Number(duration[1])*(duration[2].startsWith('h')?60:1)))):/\b(email|call|reply)\b/.test(lower)?15:/\b(project|design|study|report)\b/.test(lower)?60:30;
 const priority=/\b(urgent|asap|important|high priority)\b/.test(lower)?'High':/\b(low priority|someday|whenever)\b/.test(lower)?'Low':'Medium';
 return {title:raw.slice(0,240),category,priority,minutes,due,reason:duration?'Duration taken from your input. Review the suggested category and priority.':'Basic keyword estimate. Review these suggestions before saving.'};
 });
}
