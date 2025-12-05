import client from 'prom-client';
client.collectDefaultMetrics();
export const httpRequests = new client.Counter({name:'http_requests_total',help:'Count of HTTP requests',labelNames:['method','route','code']});
export const httpDuration = new client.Histogram({name:'http_request_duration_ms',help:'HTTP latency in ms',labelNames:['method','route','code'],buckets:[50,100,200,400,800,1600,3200]});
export function metricsMiddleware(req,res,next){const start=Date.now();res.on('finish',()=>{const route=req.route?.path||req.path||'unknown';const code=String(res.statusCode);httpRequests.inc({method:req.method,route,code});httpDuration.observe({method:req.method,route,code},Date.now()-start)});next();}
export async function metricsHandler(req,res){res.set('Content-Type', client.register.contentType);res.end(await client.register.metrics())}
