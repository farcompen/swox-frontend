import React, {useEffect, useMemo, useState} from 'react';
import { createRoot } from 'react-dom/client';
import { RefreshCw, Search, Server, PackageSearch, ExternalLink, X } from 'lucide-react';
import './styles.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://swolx-mobile.vercel.app';

function App(){
  const [products,setProducts]=useState([]);
  const [raw,setRaw]=useState(null);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  const [query,setQuery]=useState('');
  const [selected,setSelected]=useState(null);
  const [detail,setDetail]=useState(null);
  const [detailRaw,setDetailRaw]=useState(null);
  const [detailLoading,setDetailLoading]=useState(false);
  const [catName,setCatName]=useState("ayakkabi")

  const loadProducts=async()=>{
    setLoading(true); setError('');
    try{
      const r=await fetch(`${API_BASE}/api/products`);
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      const j=await r.json();
      setRaw(j); setProducts(Array.isArray(j.items)?j.items:[]);
    }catch(e){ setError(e.message || 'API hatası'); }
    finally{ setLoading(false); }
  };

  useEffect(()=>{getCategories()},[catName]);

  const filtered=useMemo(()=>products.filter(p=>{
    const s=(p.name||p.title||'').toLowerCase();
    return s.includes(query.toLowerCase());
  }),[products,query]);
const getCategories = async()=>{
  try{
    const result = await fetch(`${API_BASE}/api/products?category={catName}`);
    if(!result.ok) throw new Error(`HTTP ${result.status}`);
    const j = await result.json();
     setRaw(j); setProducts(Array.isArray(j.items)?j.items:[]);
  }catch(e){setError(e.message ||'API HATASI')}
  finally{setLoading(false);}
}
  const openDetail=async(p)=>{
    setSelected(p); setDetail(null); setDetailRaw(null); setDetailLoading(true);
    try{
      const url=p.url || p.productUrl;
      const r=await fetch(`${API_BASE}/api/product?url=${encodeURIComponent(url)}`);
      if(!r.ok) throw new Error(`HTTP ${r.status}`);
      const j=await r.json();
      setDetailRaw(j); setDetail(j.item || j.product || j);
    }catch(e){ setDetail({error:e.message}); }
    finally{ setDetailLoading(false); }
  };

  return <div className="app">
    <header>
      <div>
        <h1>SWOLX API Monitor</h1>
        <p>Backend: <a href={API_BASE} target="_blank">{API_BASE}</a></p>
      </div>
      <button onClick={loadProducts}><RefreshCw size={18}/> Yenile</button>
    </header>

    <section className="stats">
      <div><Server size={22}/><span><b>API</b><small>{error?'Hata':'Bağlı'}</small></span></div>
      <div><PackageSearch size={22}/><span><b>{products.length}</b><small>Ürün</small></span></div>
      <div><Search size={22}/><span><b>{filtered.length}</b><small>Filtre sonucu</small></span></div>
   <div>
   <button onClick={}>ayakkabı</button>
   </div>

    <div className="toolbar">
      <Search size={18}/>
      <input placeholder="Ürün ara..." value={query} onChange={e=>setQuery(e.target.value)}/>
    </div>

    {loading && <div className="notice">Ürünler yükleniyor...</div>}
    {error && <div className="notice error">API hatası: {error}</div>}

    <main className="grid">
      {filtered.map((p,i)=><article className="card" key={p.id||p.url||i} onClick={()=>openDetail(p)}>
        <div className="imgwrap">
          {p.image || p.imageUrl ? <img src={p.image || p.imageUrl} alt=""/> : <div className="noimg">Görsel yok</div>}
        </div>
        <div className="cardbody">
          <h3>{p.name || p.title || 'Ürün'}</h3>
          <div className="price">{p.price ?? '-'} {p.currency || 'TRY'}</div>
          <small>{p.url || p.productUrl}</small>
        </div>
      </article>)}
    </main>

    <section className="jsonbox">
      <h2>/api/products ham JSON</h2>
      <pre>{JSON.stringify(raw,null,2)}</pre>
    </section>

    {selected && <div className="modalback" onClick={()=>setSelected(null)}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <button className="close" onClick={()=>setSelected(null)}><X/></button>
        <h2>{selected.name || selected.title}</h2>
        {detailLoading ? <div className="notice">Detay yükleniyor...</div> : <>
          {detail?.error ? <div className="notice error">{detail.error}</div> : <>
            <div className="detailgrid">
              <div>
                {(detail?.image || detail?.imageUrl || selected.image || selected.imageUrl) && <img className="detailimg" src={detail?.image || detail?.imageUrl || selected.image || selected.imageUrl}/>} 
              </div>
              <div>
                <p><b>Fiyat:</b> {detail?.price ?? selected.price ?? '-'} {detail?.currency || selected.currency || 'TRY'}</p>
                <p><b>Numaralar/Varyantlar:</b></p>
                <div className="chips">{(detail?.sizes || detail?.variants || []).length ? (detail.sizes || detail.variants).map((s,i)=><span key={i}>{typeof s==='string'?s:(s.name||s.value||JSON.stringify(s))}</span>) : <em>Varyant bulunamadı</em>}</div>
                {(selected.url||selected.productUrl) && <a className="ext" href={selected.url||selected.productUrl} target="_blank"><ExternalLink size={16}/> Mağazada aç</a>}
              </div>
            </div>
            <h3>/api/product ham JSON</h3>
            <pre>{JSON.stringify(detailRaw,null,2)}</pre>
          </>}
        </>}
      </div>
    </div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App/>);
