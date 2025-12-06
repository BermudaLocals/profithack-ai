export async function schedule(data){const m=data?.delayMinutes??15;const when=Date.now()+m*60000;return {scheduled_for:new Date(when).toISOString()}}
