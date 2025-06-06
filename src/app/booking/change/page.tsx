"use client";
import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function getPolandDate(): Date {
  const now = new Date();
  const polandString = now.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' });
  return new Date(polandString);
}

function formatDatePoland(date: Date): string {
  const poland = new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Warsaw' }));
  const year = poland.getFullYear();
  const month = (poland.getMonth() + 1).toString().padStart(2, '0');
  const day = poland.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ChangeBookingPage() {
  const [token, setToken] = useState<string | null>(null);
  const [packageId, setPackageId] = useState<string | null>(null);
  const [date, setDate] = useState<Date | null>(null);
  const [dateStr, setDateStr] = useState("");
  const [time, setTime] = useState("");
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Получаем токен из query
  useEffect(() => {
    if (typeof window !== "undefined" && !token) {
      const t = new URLSearchParams(window.location.search).get("token");
      setToken(t);
    }
  }, [token]);

  // Загружаем packageId по токену
  useEffect(() => {
    if (!token) return;
    fetch(`/api/booking/get-by-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    })
      .then(res => res.json())
      .then(data => {
        if (data.booking && data.booking.package_id) {
          setPackageId(data.booking.package_id);
        }
      });
  }, [token]);

  // Загружаем доступные времена при выборе даты
  useEffect(() => {
    if (!date || !token || !packageId) return;
    setLoadingTimes(true);
    setTime("");
    const dateIso = formatDatePoland(date);
    setDateStr(dateIso);
    fetch("/api/booking/check-availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ date: dateIso, token, packageId })
    })
      .then(res => res.json())
      .then(data => {
        setAvailableTimes(data.times || []);
        setLoadingTimes(false);
      })
      .catch(() => {
        setAvailableTimes([]);
        setLoadingTimes(false);
      });
  }, [date, token, packageId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    if (!dateStr || !time) {
      setError("Podaj nową datę i godzinę.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/booking/change-date", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newDate: dateStr, newTime: time })
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
        <h1 style={{fontSize:24,fontWeight:800,color:'#f36e21',marginBottom:18}}>Zmiana terminu rezerwacji</h1>
        {success ? (
          <div style={{color:'#4caf50',fontWeight:700,fontSize:18}}>Termin rezerwacji został zmieniony!<br/>Potwierdzenie wysłano na Twój e-mail.</div>
        ) : (
          <form onSubmit={handleSubmit} style={{display:'flex',flexDirection:'column',gap:16}}>
            <label>Nowa data
              <DatePicker
                selected={date}
                onChange={d => setDate(d)}
                minDate={getPolandDate()}
                dateFormat="yyyy-MM-dd"
                className="datepicker-input"
                placeholderText="Wybierz datę"
                required
                popperPlacement="bottom"
                calendarStartDay={1}
                locale="pl"
              />
            </label>
            <label>Nowa godzina
              {loadingTimes ? (
                <div style={{marginTop:8, color:'#f36e21'}}>Ładowanie godzin...</div>
              ) : (
                <select
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  disabled={!date || availableTimes.length === 0}
                  style={{width:'100%',marginTop:6,background:'#18171c',color:'#fff',border:'2px solid #f36e21',borderRadius:8,padding:'10px 14px',fontSize:16,fontWeight:600,outline:'none'}}
                  required
                >
                  <option value="">{availableTimes.length === 0 ? 'Brak dostępnych godzin' : 'Wybierz godzinę'}</option>
                  {availableTimes.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              )}
            </label>
            {error && <div style={{color:'#ff4d4f',fontWeight:600}}>{error}</div>}
            <button type="submit" disabled={loading || loadingTimes} style={{background:'#f36e21',color:'#fff',border:'none',borderRadius:8,padding:'12px 0',fontWeight:700,fontSize:18,cursor:loading?'not-allowed':'pointer',marginTop:8}}>
              {loading ? 'Zapisywanie...' : 'Zmień termin'}
            </button>
          </form>
        )}
      </div>
      <style>{`
        .datepicker-input {
          background: #18171c;
          color: #fff;
          border: 2px solid #f36e21;
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 16px;
          font-weight: 600;
          outline: none;
          width: 100%;
        }
        .datepicker-input:focus {
          border-color: #ff9f58;
        }
        .react-datepicker__day--selected,
        .react-datepicker__day--keyboard-selected {
          background: #f36e21 !important;
          color: #fff !important;
        }
        .react-datepicker__day--today {
          color: #000 !important;
          border: 0.1px solid #f36e21;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
} 