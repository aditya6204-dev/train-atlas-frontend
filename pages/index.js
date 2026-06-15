import React, { useState, useEffect } from 'react';

export default function TaJournalGenerator() {
  const [queryFrom, setQueryFrom] = useState('');
  const [suggestionsFrom, setSuggestionsFrom] = useState([]);
  const [selectedFrom, setSelectedFrom] = useState(null);

  const [queryTo, setQueryTo] = useState('');
  const [suggestionsTo, setSuggestionsTo] = useState([]);
  const [selectedTo, setSelectedTo] = useState(null);

  const [trainNo, setTrainNo] = useState('');
  const [taRows, setTaRows] = useState([]);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    if (queryFrom.length < 2) { setSuggestionsFrom([]); return; }
    const delayDebounce = setTimeout(() => {
      fetch(`${API_BASE}/api/stations/suggest?q=${queryFrom}`)
        .then(res => res.json())
        .then(data => setSuggestionsFrom(data)).catch(err => console.log(err));
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [queryFrom]);

  useEffect(() => {
    if (queryTo.length < 2) { setSuggestionsTo([]); return; }
    const delayDebounce = setTimeout(() => {
      fetch(`${API_BASE}/api/stations/suggest?q=${queryTo}`)
        .then(res => res.json())
        .then(data => setSuggestionsTo(data)).catch(err => console.log(err));
    }, 200);
    return () => clearTimeout(delayDebounce);
  }, [queryTo]);

  const handleAddJourney = async () => {
    if (!selectedFrom || !selectedTo || !trainNo) {
      alert("Please select stations from the auto-suggestions drop down list.");
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/api/ta/calculate?trainNo=${trainNo}&fromCode=${selectedFrom.station_code}&toCode=${selectedTo.station_code}`);
      const data = await response.json();
      if (response.ok) {
        const dateToday = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit' });
        setTaRows([...taRows, { ...data, date: dateToday }]);
        setQueryFrom(''); setQueryTo(''); setSelectedFrom(null); setSelectedTo(null); setTrainNo('');
      } else {
        alert(data.error);
      }
    } catch (err) { alert("Backend communication error."); }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f8fafc' }}>
      <div className="print-hidden" style={{ marginBottom: '30px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ marginTop: 0 }}>Train Atlas (TA) Input Panel</h2>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>TRAIN NO</label>
            <input type="text" value={trainNo} onChange={e => setTrainNo(e.target.value)} placeholder="e.g. 12565" style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>FROM STATION (Type Short Form)</label>
            <input type="text" value={selectedFrom ? `${selectedFrom.station_name} (${selectedFrom.station_code})` : queryFrom} onChange={e => { setSelectedFrom(null); setQueryFrom(e.target.value); }} placeholder="e.g. DBG" style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            {suggestionsFrom.length > 0 && (
              <ul style={{ position: 'absolute', background: '#fff', border: '1px solid #ccc', width: '100%', margin: 0, padding: 0, listStyle: 'none', zIndex: 10 }}>
                {suggestionsFrom.map(st => <li key={st.station_code} onClick={() => { setSelectedFrom(st); setSuggestionsFrom([]); }} style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}>{st.station_code} - {st.station_name}</li>)}
              </ul>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold' }}>TO STATION (Type Short Form)</label>
            <input type="text" value={selectedTo ? `${selectedTo.station_name} (${selectedTo.station_code})` : queryTo} onChange={e => { setSelectedTo(null); setQueryTo(e.target.value); }} placeholder="e.g. HWH" style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }} />
            {suggestionsTo.length > 0 && (
              <ul style={{ position: 'absolute', background: '#fff', border: '1px solid #ccc', width: '100%', margin: 0, padding: 0, listStyle: 'none', zIndex: 10 }}>
                {suggestionsTo.map(st => <li key={st.station_code} onClick={() => { setSelectedTo(st); setSuggestionsTo([]); }} style={{ padding: '8px', cursor: 'pointer', borderBottom: '1px solid #eee' }}>{st.station_code} - {st.station_name}</li>)}
              </ul>
            )}
          </div>
          <button onClick={handleAddJourney} style={{ alignSelf: 'flex-end', padding: '10px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Add to Form</button>
          <button onClick={() => window.print()} style={{ alignSelf: 'flex-end', padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Print Form</button>
        </div>
      </div>

      {/* Printable Sheet Content Structure Matching PDF Specifications */}
      <div style={{ background: '#fff', padding: '30px', border: '1px solid #cbd5e1' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'between', fontSize: '11px', fontWeight: 'bold' }}>
            <span>जीए-31/GA-31</span>
            <span style={{ marginLeft: 'auto' }}>एस आर सि / जी-1677/SRC/G-1677</span>
          </div>
          <h2 style={{ margin: '5px 0' }}>पूर्व रेलवे / E. Rly. / पूर्व मध्य रेलवे / E. C. Rly.</h2>
          <h3 style={{ textDecoration: 'underline' }}>यात्रा-भत्ता विवरण / TRAVELLING ALLOWANCE JOURNAL</h3>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '2px solid black', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid black' }}>
              <th style={{ border: '1px solid black', padding: '6px' }}>Month & Date<br/>महीना तारीख</th>
              <th style={{ border: '1px solid black', padding: '6px' }}>Train No.<br/>गाड़ी नं ०</th>
              <th style={{ border: '1px solid black', padding: '6px' }}>Time Left<br/>प्रस्थान समय</th>
              <th style={{ border: '1px solid black', padding: '6px' }}>Time Arrived<br/>पहुंचने समय</th>
              <th style={{ border: '1px solid black', padding: '6px' }}>From Station<br/>से</th>
              <th style={{ border: '1px solid black', padding: '6px' }}>To Station<br/>तक</th>
              <th style={{ border: '1px solid black', padding: '6px' }}>Kms.<br/>किमी</th>
              <th style={{ border: '1px solid black', padding: '6px' }}>Days/Nights<br/>दिन / रात</th>
              <th style={{ border: '1px solid black', padding: '6px' }}>Object of Journey<br/>यात्रा का उद्देश्य</th>
              <th style={{ border: '1px solid black', padding: '6px' }}>Rate<br/>दर</th>
              <th style={{ border: '1px solid black', padding: '6px' }}>Rs.</th>
              <th style={{ border: '1px solid black', padding: '6px' }}>P.</th>
            </tr>
          </thead>
          <tbody>
            {taRows.map((row, index) => (
              <tr key={index} style={{ textAlign: 'center' }}>
                <td style={{ border: '1px solid black', padding: '6px' }}>{row.date}</td>
                <td style={{ border: '1px solid black', padding: '6px' }}>{row.trainNo}</td>
                <td style={{ border: '1px solid black', padding: '6px' }}>{row.timeLeft}</td>
                <td style={{ border: '1px solid black', padding: '6px' }}>{row.timeArrived}</td>
                <td style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold' }}>{row.fromStation}</td>
                <td style={{ border: '1px solid black', padding: '6px', fontWeight: 'bold' }}>{row.toStation}</td>
                <td style={{ border: '1px solid black', padding: '6px' }}>{row.kms}</td>
                <td style={{ border: '1px solid black', padding: '6px' }}>1</td>
                <td style={{ border: '1px solid black', padding: '6px' }}>{row.objectOfJourney}</td>
                <td style={{ border: '1px solid black', padding: '6px' }}>-</td>
                <td style={{ border: '1px solid black', padding: '6px' }}></td>
                <td style={{ border: '1px solid black', padding: '6px' }}></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <style padding="none">{`@media print { .print-hidden { display: none !important; } }`}</style>
    </div>
  );
}
