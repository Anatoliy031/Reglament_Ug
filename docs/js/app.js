async function loadData(){
  const res = await fetch('data/reglaments.json', {cache:'no-store'});
  if(!res.ok) throw new Error('Не удалось загрузить data/reglaments.json');
  return await res.json();
}
function qs(sel, root=document){ return root.querySelector(sel); }
function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }

function formatDate(iso){
  if(!iso) return '';
  try{
    const d = new Date(iso + 'T00:00:00');
    return new Intl.DateTimeFormat('ru-RU',{day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
  }catch(e){ return iso; }
}
function formatBytes(bytes){
  const units=['Б','КБ','МБ','ГБ'];
  let b=bytes, u=0;
  while(b>=1024 && u<units.length-1){ b/=1024; u++; }
  return (u===0? b.toFixed(0) : b.toFixed(1)) + ' ' + units[u];
}
function getParam(name){
  const url = new URL(window.location.href);
  return url.searchParams.get(name);
}
function enc(href){
  // Encode path parts but keep slashes
  return href.split('/').map(encodeURIComponent).join('/');
}

function uniq(arr){ return Array.from(new Set(arr)).sort(); }

function regUrl(id){ return `reglament.html?id=${encodeURIComponent(id)}`; }

function normalize(s){ return (s||'').toString().toLowerCase(); }

function matchText(reg, needle){
  if(!needle) return true;
  const n = normalize(needle);
  const hay = [
    reg.id, reg.code, reg.title, reg.short, reg.theme, reg.status,
    (reg.tags||[]).join(' '),
    ...(reg.files||[]).map(f=>f.name)
  ].join(' ');
  return normalize(hay).includes(n);
}

function renderIndex(data){
  const regs = data.reglaments;
  qs('#total').textContent = regs.length;

  const byTheme = {};
  regs.forEach(r=>{
    byTheme[r.theme] = byTheme[r.theme] || [];
    byTheme[r.theme].push(r);
  });

  const themesWrap = qs('#themes');
  themesWrap.innerHTML = '';
  Object.keys(byTheme).sort().forEach(theme=>{
    const list = byTheme[theme].slice().sort((a,b)=> (b.date||'').localeCompare(a.date||''));
    const div = document.createElement('div');
    div.className='card';
    div.style.gridColumn='span 6';
    div.innerHTML = `
      <div class="h2">${theme || 'Без темы'}</div>
      <div class="p">Документов: <b>${list.length}</b></div>
      <div class="kv" style="margin-top:12px">
        <a class="btn primary" href="catalog.html#${encodeURIComponent(theme)}">Открыть в каталоге</a>
      </div>
      <hr class="sep">
      <div class="small">Последние:</div>
      <div style="margin-top:8px;display:flex;flex-direction:column;gap:8px">
        ${list.slice(0,3).map(r=>`
          <div>
            <a href="${regUrl(r.id)}"><b>№${r.id}</b> — ${r.title}</a>
            <div class="small">${formatDate(r.date)} • ${r.status}</div>
          </div>
        `).join('')}
      </div>
    `;
    themesWrap.appendChild(div);
  });

  const quick = qs('#quick');
  quick.innerHTML = regs
    .slice().sort((a,b)=> (b.date||'').localeCompare(a.date||''))
    .slice(0,5)
    .map(r=>`<div><a href="${regUrl(r.id)}"><b>№${r.id}</b> — ${r.title}</a> <span class="small">(${formatDate(r.date)})</span></div>`)
    .join('');
}

function renderCatalog(data){
  const regs = data.reglaments.slice().sort((a,b)=> (b.date||'').localeCompare(a.date||''));

  const themes = uniq(regs.map(r=>r.theme).filter(Boolean));
  const statuses = uniq(regs.map(r=>r.status).filter(Boolean));
  const years = uniq(regs.map(r=> (r.date||'').slice(0,4)).filter(Boolean)).sort((a,b)=>b.localeCompare(a));

  const themeSel = qs('#fTheme');
  themeSel.innerHTML = `<option value="">Все</option>` + themes.map(t=>`<option value="${t}">${t}</option>`).join('');
  const statusSel = qs('#fStatus');
  statusSel.innerHTML = `<option value="">Все</option>` + statuses.map(s=>`<option value="${s}">${s}</option>`).join('');
  const yearSel = qs('#fYear');
  yearSel.innerHTML = `<option value="">Все</option>` + years.map(y=>`<option value="${y}">${y}</option>`).join('');

  const hash = decodeURIComponent((window.location.hash||'').replace('#',''));
  if(hash && themes.includes(hash)) themeSel.value = hash;

  function apply(){
    const needle = qs('#fSearch').value.trim();
    const theme = themeSel.value;
    const status = statusSel.value;
    const year = yearSel.value;

    const filtered = regs.filter(r=>{
      if(theme && r.theme!==theme) return false;
      if(status && r.status!==status) return false;
      if(year && (r.date||'').slice(0,4)!==year) return false;
      if(!matchText(r, needle)) return false;
      return true;
    });

    qs('#count').textContent = filtered.length;

    const tbody = qs('#tbl tbody');
    tbody.innerHTML = filtered.map(r=>{
      const badge = r.status==='Утверждено' ? 'good' : (r.status==='Проект' ? 'bad' : '');
      return `
        <tr>
          <td><a href="${regUrl(r.id)}"><b>${r.id}</b></a></td>
          <td>${formatDate(r.date)}</td>
          <td>
            <a href="${regUrl(r.id)}"><b>${r.title}</b></a>
            <div class="small">${r.short||''}</div>
            <div class="kv" style="margin-top:8px">
              ${(r.tags||[]).slice(0,6).map(t=>`<span class="badge">#${t}</span>`).join('')}
            </div>
          </td>
          <td>${r.theme||''}</td>
          <td><span class="badge ${badge}">${r.status||''}</span></td>
          <td class="small">${(r.files||[]).length} файлов</td>
        </tr>
      `;
    }).join('');
  }

  qsa('#fSearch,#fTheme,#fStatus,#fYear').forEach(el=>{
    el.addEventListener('input', apply);
    el.addEventListener('change', apply);
  });
  qs('#btnReset').addEventListener('click', ()=>{
    qs('#fSearch').value='';
    themeSel.value='';
    statusSel.value='';
    yearSel.value='';
    window.location.hash='';
    apply();
  });

  apply();
}

function groupFiles(reg){
  const base = `assets/Регламенты ЮГ/${reg.folder}/`;
  const groups = {};
  (reg.files||[]).forEach(f=>{
    const rel = (f.web||'').startsWith(base) ? (f.web||'').slice(base.length) : f.web;
    const parts = rel.split('/');
    const group = (parts.length>1) ? parts[0] : 'Файлы в корне';
    groups[group] = groups[group] || [];
    groups[group].push({...f, rel});
  });
  Object.values(groups).forEach(arr=>arr.sort((a,b)=>a.rel.localeCompare(b.rel)));
  const keys = Object.keys(groups).sort((a,b)=>{
    if(a==='Файлы в корне') return -1;
    if(b==='Файлы в корне') return 1;
    return a.localeCompare(b,'ru');
  });
  return {keys, groups};
}

function renderReglament(data){
  const id = getParam('id');
  const reg = data.reglaments.find(r=>r.id===id);
  if(!reg){
    qs('#reg').innerHTML = `<div class="card"><div class="h2">Регламент не найден</div><div class="p">Проверьте ссылку. Вернитесь в <a href="catalog.html">каталог</a>.</div></div>`;
    return;
  }
  document.title = `№${reg.id} — ${reg.title}`;

  const badge = reg.status==='Утверждено' ? 'good' : (reg.status==='Проект' ? 'bad' : '');
  const rels = (reg.related||[]).map(x=>`<div><span class="small">${x.type}:</span> <a href="${regUrl(x.id)}"><b>№${x.id}</b></a></div>`).join('');
  const {keys, groups} = groupFiles(reg);

  qs('#title').textContent = `№${reg.id} — ${reg.title}`;
  qs('#meta').innerHTML = `
    <span class="badge">${formatDate(reg.date)}</span>
    <span class="badge">${reg.theme||''}</span>
    <span class="badge ${badge}">${reg.status||''}</span>
  `;
  qs('#short').textContent = reg.short || '';

  qs('#tags').innerHTML = (reg.tags||[]).map(t=>`<span class="badge">#${t}</span>`).join('') || '<span class="small">Теги не заданы</span>';

  qs('#downloadAll').href = enc(reg.pack);
  qs('#downloadAll').setAttribute('download', `reglament_${reg.id}.zip`);

  qs('#related').innerHTML = rels || '<span class="small">Связанных документов нет.</span>';

  const fileFilter = qs('#fileFilter');
  const fileWrap = qs('#files');

  function drawFiles(){
    const needle = normalize(fileFilter.value.trim());
    fileWrap.innerHTML = '';
    keys.forEach(k=>{
      const list = groups[k].filter(f=>{
        if(!needle) return true;
        return normalize(f.rel).includes(needle) || normalize(f.name).includes(needle);
      });
      if(list.length===0) return;

      const det = document.createElement('details');
      det.open = (keys.length<=3);
      const totalSize = list.reduce((s,f)=>s+(f.size||0),0);
      det.innerHTML = `
        <summary>${k} <span class="small">(${list.length} • ${formatBytes(totalSize)})</span></summary>
        <div style="margin-top:8px"></div>
      `;
      const inner = det.querySelector('div');

      list.forEach(f=>{
        const row = document.createElement('div');
        row.className='file-row';
        row.innerHTML = `
          <div class="file-name" title="${f.rel}">
            <a href="${enc(f.web)}" target="_blank" rel="noopener">${f.rel}</a>
          </div>
          <div class="file-meta">
            <span class="small">${(f.ext||'').toUpperCase()}</span>
            <span class="small">${formatBytes(f.size||0)}</span>
          </div>
        `;
        inner.appendChild(row);
      });

      fileWrap.appendChild(det);
    });

    qs('#fileCount').textContent = qsa('.file-row', fileWrap).length;
  }

  fileFilter.addEventListener('input', drawFiles);
  drawFiles();
}

window.RegSite = { loadData, renderIndex, renderCatalog, renderReglament };
