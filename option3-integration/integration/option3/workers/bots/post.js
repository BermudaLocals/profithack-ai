export async function post(data){return {posted:true,platform:data?.platform||'x',id:Date.now().toString()}}
