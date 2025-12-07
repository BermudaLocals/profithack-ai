import Link from "next/link";

export default function Home() {
  return (
    <main style={{minHeight:'100vh',display:'grid',placeItems:'center',background:'#0c0c12',color:'#e7f8ff',textAlign:'center',padding:'2rem'}}>
      <div>
        <h1 style={{fontSize:'2.2rem',marginBottom:'0.5rem'}}>ProfitHack AI — Creator SuperApp</h1>
        <p style={{opacity:.9,maxWidth:720,margin:'0 auto 1.25rem'}}>
          Create. Connect. Earn. Post like TikTok, earn like a pro. This is a scaffold; connect to the API at <code>{process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}</code>.
        </p>
        <p><Link href="/status">Status</Link> • <a href="http://localhost:4000/healthz">API Health</a></p>
        <div style={{marginTop:'1.25rem'}}>
          <a href="https://ProfitHackAI.com" style={{padding:'12px 18px',background:'#7c3aed',borderRadius:10,color:'#fff',textDecoration:'none'}}>Join the Waitlist</a>
        </div>
      </div>
    </main>
  );
}
