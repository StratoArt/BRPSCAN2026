const API_URL="https://script.google.com/macros/s/AKfycbywwfIOAfMAsw35UmqcW7spSk5VleJgcOkRZJ3cmjKotxar-4ZSYVgBTHOYSuaDbRiaoA/exec";
let D=window.R2_DATA||{retailers:[],products:[],scans:[]}, R=D.retailers, P=D.products, S=D.scans, donut, bar;
const n=x=>Number(x)||0;
const f=x=>n(x).toLocaleString('id-ID');
const pct=x=>(n(x)*100).toFixed(1)+'%';
const q3=r=>S.filter(s=>String(s.Retailer_ID)==String(r.Retailer_ID)).reduce((a,s)=>a+n(s.Point),0);
const ytd=r=>n(r.Q1_Point)+n(r.Q2_Point)+q3(r);

function setData(data){
  if(!data) return;
  D={retailers:data.retailers||data.RETAILER_MASTER||[],products:data.products||data.PRODUCT_MASTER||[],scans:data.scans||data.SCAN_DATA||[]};
  R=D.retailers; P=D.products; S=D.scans;
  refreshFilters(); inputInit(); render();
}
async function loadLive(){
  try{
    setStatus('Memuat data Google Sheets…');
    const res=await fetch(API_URL,{cache:'no-store'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data=await res.json();
    if(data.ok===false) throw new Error(data.error||'API error');
    setData(data); setStatus('● Terhubung ke Google Sheets');
  }catch(err){ console.error(err); setStatus('● Mode offline — memakai data snapshot'); }
}
function setStatus(msg){const el=document.getElementById('status');if(el)el.textContent=msg;}
function calc(){
  const sales=document.getElementById('salesFilter').value, area=document.getElementById('areaFilter').value;
  let rs=R.filter(r=>!sales||r.Sales==sales).filter(r=>!area||r.Area==area);
  let qt=rs.reduce((a,r)=>a+n(r.Q3_Target),0), qa=rs.reduce((a,r)=>a+q3(r),0), at=rs.reduce((a,r)=>a+n(r.Annual_Target_2026),0), yt=rs.reduce((a,r)=>a+ytd(r),0);
  return {rs,qt,qa,at,yt};
}
function render(){
  const x=calc(),qa=x.qa,qt=x.qt,yt=x.yt,at=x.at;
  document.getElementById('q3target').textContent=f(qt); document.getElementById('q3actual').textContent=f(qa);
  document.getElementById('q3ach').textContent=qt?pct(qa/qt):'0%'; document.getElementById('annual').textContent=f(at);
  document.getElementById('ytd').textContent=f(yt); document.getElementById('ytdach').textContent=at?pct(yt/at):'0%';
  document.getElementById('donutText').textContent=qt?pct(qa/qt):'0%';
  if(donut)donut.destroy();
  donut=new Chart(document.getElementById('donut'),{type:'doughnut',data:{labels:['Actual','Gap'],datasets:[{data:[Math.min(qa,qt),Math.max(qt-qa,0)]}]},options:{cutout:'75%',plugins:{legend:{position:'bottom'}}}});
  const qs=[x.rs.reduce((a,r)=>a+n(r.Q1_Point),0),x.rs.reduce((a,r)=>a+n(r.Q2_Point),0),qa];
  if(bar)bar.destroy();
  bar=new Chart(document.getElementById('quarter'),{type:'bar',data:{labels:['Q1','Q2','Q3'],datasets:[{label:'Point',data:qs}]},options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}});
  let rank=x.rs.map(r=>({name:r.Retailer_Name,p:q3(r)})).sort((a,b)=>b.p-a.p).slice(0,8);
  document.getElementById('rank').innerHTML=rank.map((a,i)=>`<div class="rankrow"><span>#${i+1}</span><b>${a.name}</b><b>${f(a.p)}</b></div>`).join('');
  let ar=x.rs.map(r=>({name:r.Retailer_Name,p:n(r.Q3_Target)?q3(r)/n(r.Q3_Target):0})).sort((a,b)=>b.p-a.p).slice(0,8);
  document.getElementById('achrank').innerHTML=ar.map((a,i)=>`<div class="rankrow"><span>#${i+1}</span><b>${a.name}</b><b>${pct(a.p)}</b></div>`).join('');
  document.getElementById('table').innerHTML=x.rs.slice().sort((a,b)=>q3(b)-q3(a)).map(r=>`<tr><td>${r.Retailer_Name}</td><td>${f(r.Q3_Target)}</td><td>${f(q3(r))}</td><td>${pct(n(r.Q3_Target)?q3(r)/n(r.Q3_Target):0)}</td><td>${f(r.Annual_Target_2026)}</td><td>${f(ytd(r))}</td><td>${pct(n(r.Annual_Target_2026)?ytd(r)/n(r.Annual_Target_2026):0)}</td></tr>`).join('');
}

function refreshFilters(){
  const salesEl=document.getElementById('salesFilter'),areaEl=document.getElementById('areaFilter');
  const oldSales=salesEl.value,oldArea=areaEl.value;
  salesEl.innerHTML='<option value="">Semua Sales</option>'; areaEl.innerHTML='<option value="">Semua Area</option>';
  [...new Set(R.map(r=>r.Sales).filter(Boolean))].forEach(v=>salesEl.insertAdjacentHTML('beforeend',`<option value="${v}">${v}</option>`));
  [...new Set(R.map(r=>r.Area).filter(Boolean))].forEach(v=>areaEl.insertAdjacentHTML('beforeend',`<option value="${v}">${v}</option>`));
  salesEl.value=oldSales;areaEl.value=oldArea;
}

let productRows=[];
function inputInit(){
  const sf=document.getElementById('inputSalesFilter');
  if(!sf)return;
  const old=sf.value;
  sf.innerHTML='<option value="">Semua Sales</option>';
  [...new Set(R.map(r=>r.Sales).filter(Boolean))].forEach(v=>sf.insertAdjacentHTML('beforeend',`<option value="${v}">${v}</option>`));
  sf.value=old;
  refreshRetailerSelect();
  if(!productRows.length) productRows=[{id:Date.now()}];
  renderProductRows();
}
function refreshRetailerSelect(){
  const sf=document.getElementById('inputSalesFilter'), rs=document.getElementById('rsel');
  if(!sf||!rs)return;
  const sales=sf.value, old=rs.value;
  const retailers=R.filter(r=>String(r.Active).toUpperCase()=='YES').filter(r=>!sales||r.Sales==sales);
  rs.innerHTML=retailers.length?retailers.map(r=>`<option value="${r.Retailer_ID}">${r.Retailer_Name}</option>`).join(''):'<option value="">Tidak ada retailer</option>';
  if(retailers.some(r=>String(r.Retailer_ID)==String(old)))rs.value=old;
}
function rowProduct(rowId){return productRows.find(x=>x.id===rowId);}
function renderProductRows(){
  const wrap=document.getElementById('productRows'); if(!wrap)return;
  wrap.innerHTML=productRows.map((row,i)=>{
    const p=P.find(x=>String(x.Product_ID)==String(row.productId))||P.find(x=>String(x.Active).toUpperCase()=='YES')||{};
    const q=n(row.qty||1);
    const options=P.filter(x=>String(x.Active).toUpperCase()=='YES').map(x=>`<option value="${x.Product_ID}" ${String(x.Product_ID)==String(row.productId)?'selected':''}>${x.Product_Name} — ${x.Pack_Size||''}</option>`).join('');
    return `<div class="product-row" data-row="${row.id}">
      <div class="product-row-grid">
        <label>Product<select class="row-product">${options}</select></label>
        <label>Qty Box<input class="row-qty" type="number" min="1" value="${q}"></label>
        <button type="button" class="remove" title="Hapus produk" ${productRows.length===1?'disabled':''}>×</button>
      </div>
      <div class="product-meta">
        <div>Point/Box<b>${f(p.Point_Per_Box)}</b></div>
        <div>Volume/Box<b>${f(p.Volume_Per_Box)} ${p.Volume_Unit||''}</b></div>
        <div>Value/Box<b>${f(p.Value_Per_Box)}</b></div>
      </div>
    </div>`;
  }).join('');
  wrap.querySelectorAll('.product-row').forEach(el=>{
    const id=Number(el.dataset.row), row=rowProduct(id);
    el.querySelector('.row-product').onchange=e=>{row.productId=e.target.value;renderProductRows();};
    el.querySelector('.row-qty').oninput=e=>{row.qty=n(e.target.value);updateGrandTotals();};
    el.querySelector('.remove').onclick=()=>{if(productRows.length>1){productRows=productRows.filter(x=>x.id!==id);renderProductRows();}};
  });
  updateGrandTotals();
}
function updateGrandTotals(){
  let point=0,volume=0,value=0;
  productRows.forEach(row=>{
    const p=P.find(x=>String(x.Product_ID)==String(row.productId))||{};
    const q=n(row.qty);
    point+=q*n(p.Point_Per_Box);volume+=q*n(p.Volume_Per_Box);value+=q*n(p.Value_Per_Box);
  });
  document.getElementById('grandPoint').textContent=f(point);
  document.getElementById('grandVolume').textContent=f(volume);
  document.getElementById('grandValue').textContent=f(value);
}
async function saveScan(){
  const rid=document.getElementById('rsel').value;
  const valid=productRows.map(row=>({row,p:P.find(x=>String(x.Product_ID)==String(row.productId)),q:n(row.qty)})).filter(x=>x.p&&x.q>0);
  if(!rid||!valid.length){setStatus('⚠️ Pilih retailer dan minimal satu produk dengan Qty Box > 0.');return;}
  const btn=document.getElementById('save');btn.disabled=true;btn.textContent='Menyimpan…';
  try{
    const scans=valid.map(x=>({Retailer_ID:rid,Product_ID:x.p.Product_ID,Qty_Box:x.q}));
    const res=await fetch(API_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({scans})});
    const text=await res.text();let data=null;try{data=JSON.parse(text)}catch(_){}
    if(!res.ok)throw new Error('HTTP '+res.status);
    if(data&&data.ok===false)throw new Error(data.error||'Gagal menyimpan');
    setStatus(`✓ ${scans.length} produk berhasil disimpan ke Google Sheets.`);
    productRows=[{id:Date.now(),qty:1}];renderProductRows();await loadLive();
  }catch(err){console.error(err);setStatus('❌ Gagal menyimpan: '+err.message);}
  finally{btn.disabled=false;btn.textContent='Simpan Q3';}
}

document.addEventListener('DOMContentLoaded',()=>{
  document.querySelectorAll('.nav').forEach(b=>b.onclick=()=>{
    document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.page').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');document.getElementById(b.dataset.page).classList.add('active');
    if(b.dataset.page==='dashboard')render();
    if(b.dataset.page==='input'){inputInit();}
  });
  document.getElementById('salesFilter').onchange=render;
  document.getElementById('areaFilter').onchange=render;
  document.getElementById('inputSalesFilter').onchange=()=>{refreshRetailerSelect();};
  document.getElementById('addProduct').onclick=()=>{productRows.push({id:Date.now()+Math.random(),qty:1});renderProductRows();};
  document.getElementById('save').onclick=saveScan;
  refreshFilters();inputInit();render();loadLive();
});
