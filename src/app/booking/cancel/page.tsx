"use client";
import { useState, useEffect } from "react";

export default function CancelBookingPage() {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && !token) {
      const url = new URL(window.location.href);
      const t = url.searchParams.get("token");
      setToken(t);
    }
  }, [token]);

  const handleCancel = async () => {
    setLoading(true);
    setError("");
    setSuccess(false);
    const res = await fetch("/api/booking/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });
    const data = await res.json();
    setLoading(false);
    if (data.ok) {
      setSuccess(true);
    } else {
      setError(data.error || "Wystąpił błąd. Spróbuj ponownie.");
    }
  };

  if (!token) {
    return <div style={{color:'#fff',textAlign:'center',marginTop:80}}>Brak tokenu w linku.</div>;
  }

  return (
    <div style={{minHeight:'100vh',background:'#18171c',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <div style={{background:'#23222a',borderRadius:16,padding:32,maxWidth:400,width:'100%',color:'#fff',boxShadow:'0 4px 32px #0008'}}>
        <h1 style={{fontSize:24,fontWeight:800,color:'#f36e21',marginBottom:18}}>Anulowanie rezerwacji</h1>
        {success ? (
          <div style={{color:'#4caf50',fontWeight:700,fontSize:18}}>Rezerwacja została anulowana.<br/>Potwierdzenie wysłano na Twój e-mail.</div>
        ) : confirmed ? (
          <div style={{color:'#f36e21',fontWeight:700,fontSize:18}}>Anulowanie rezerwacji... Proszę czekać.</div>
        ) : (
          <>
            <div style={{marginBottom:18}}>Czy na pewno chcesz anulować swoją rezerwację?</div>
            {error && <div style={{color:'#ff4d4f',fontWeight:600,marginBottom:8}}>{error}</div>}
            <button onClick={()=>{setConfirmed(true);handleCancel();}} disabled={loading} style={{background:'#f36e21',color:'#fff',border:'none',borderRadius:8,padding:'12px 0',fontWeight:700,fontSize:18,cursor:loading?'not-allowed':'pointer',marginTop:8,width:'100%'}}>
              {loading ? 'Anulowanie...' : 'Tak, anuluj rezerwację'}
            </button>
          </>
        )}
      </div>
    </div>
  );
} 