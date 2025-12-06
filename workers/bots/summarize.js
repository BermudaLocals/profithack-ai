export async function summarize(data){const t=String(data?.text||'').trim();return (t.length<=240)?t:t.slice(0,239)+'…'}
