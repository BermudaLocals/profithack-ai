import { RateLimiterRedis } from 'rate-limiter-flexible';
import { redis } from './redis.js';
const points=parseInt(process.env.RATE_LIMIT_POINTS||'60',10);
const duration=parseInt(process.env.RATE_LIMIT_DURATION||'60',10);
const limiter=new RateLimiterRedis({storeClient:redis,points,duration,keyPrefix:'rlf'});
export function rateLimit(routeKey='global'){return async(req,res,next)=>{const key=`${routeKey}:${req.ip}`;try{await limiter.consume(key,1);next()}catch(rej){res.set('Retry-After',String(Math.ceil(rej.msBeforeNext/1000)));res.status(429).json({error:'Too Many Requests'})}}}
