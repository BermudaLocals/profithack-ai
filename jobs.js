import { Queue } from 'bullmq';
import { redis as connection } from '../lib/redis.js';
const jobQueue=new Queue('jobs',{connection});
export function jobsRoutes(app){app.post('/api/jobs/trigger',async(req,res)=>{const {type='summarize',payload={}}=req.body||{};const j=await jobQueue.add(type,payload,{attempts:3,backoff:{type:'exponential',delay:1000}});res.json({queued:true,id:j.id})});}
