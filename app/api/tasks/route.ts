import {getDb} from '@/db';
import {tasks} from '@/db/schema';
import {and,eq,desc} from 'drizzle-orm';
import {taskInput} from '@/lib/planner';
import {user,failure,safeWrite} from '@/lib/server';
import {z} from 'zod';
export async function GET(){try{const u=await user();return Response.json(await getDb().select().from(tasks).where(eq(tasks.userId,u.userId)).orderBy(desc(tasks.createdAt)));}catch(e){return failure(e);}}
export async function POST(req:Request){try{safeWrite(req);const u=await user();const body=z.object({tasks:z.array(taskInput).min(1).max(12)}).parse(await req.json());const now=new Date().toISOString();const rows=body.tasks.map(t=>({...t,id:crypto.randomUUID(),userId:u.userId,createdAt:now}));await getDb().insert(tasks).values(rows);return Response.json({ok:true});}catch(e){return failure(e);}}
export async function PATCH(req:Request){try{safeWrite(req);const u=await user();const raw=z.record(z.unknown()).parse(await req.json());const id=z.string().uuid().parse(raw.id);const change=raw.title===undefined?{completed:z.boolean().parse(raw.completed),start:null,scheduledDate:null}:{...taskInput.parse(raw),start:null,scheduledDate:null};const result=await getDb().update(tasks).set(change).where(and(eq(tasks.id,id),eq(tasks.userId,u.userId))).returning({id:tasks.id});if(!result.length)return Response.json({error:'Task not found.'},{status:404});return Response.json({ok:true});}catch(e){return failure(e);}}
export async function DELETE(req:Request){try{safeWrite(req);const u=await user();const id=z.string().uuid().parse(new URL(req.url).searchParams.get('id'));await getDb().delete(tasks).where(and(eq(tasks.id,id),eq(tasks.userId,u.userId)));return Response.json({ok:true});}catch(e){return failure(e);}}
