import { getChatGPTUser } from '@/app/chatgpt-auth';
export async function user(){const u=await getChatGPTUser();if(!u)throw new Error('UNAUTHORIZED');return u;}
export function failure(e:unknown){if(e instanceof Error&&e.message==='UNAUTHORIZED')return Response.json({error:'Please sign in to continue.'},{status:401});if(e&&typeof e==='object'&&'issues' in e)return Response.json({error:'Please check the task fields and try again.'},{status:400});console.error(e instanceof Error?e.message:'Request failed');return Response.json({error:'Something went wrong. Your changes were not saved. Please try again.'},{status:500});}
export function safeWrite(req:Request){const origin=req.headers.get('origin');if(origin&&origin!==new URL(req.url).origin)throw new Error('UNAUTHORIZED');}
