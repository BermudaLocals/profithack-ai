export default async function Status() {
  let api = "http://localhost:4000/healthz";
  let ok = false;
  try {
    const r = await fetch(api, { cache: "no-store" });
    ok = r.ok;
  } catch(e){}
  return (
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#0c0c12',color:'#e7f8ff'}}>
      <div>
        <h2>System Status</h2>
        <p>API: {ok ? "✅ Healthy" : "❌ Unreachable"}</p>
      </div>
    </main>
  );
}
