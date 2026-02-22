// assistant sidebar script (stylish UI)
window.addEventListener('DOMContentLoaded', () => {
  // Create sidebar container
  const sidebar = document.createElement('aside');
  sidebar.id = 'kodex-ai-sidebar';
  sidebar.className = 'kodex-ai';
  sidebar.innerHTML = `
    <div class="ai-header">
      <div class="ai-left">
        <div class="ai-avatar" aria-hidden="true">
          <svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="g1" x1="0" x2="1">
                <stop offset="0" stop-color="#6EE7B7"/>
                <stop offset="1" stop-color="#3B82F6"/>
              </linearGradient>
            </defs>
            <rect rx="10" width="44" height="44" fill="url(#g1)"/>
            <g fill="#fff" transform="translate(10,10)">
              <circle cx="12" cy="8" r="4" />
              <path d="M2 28c2-6 20-6 22 0v2H2v-2z"/>
            </g>
          </svg>
        </div>
        <div class="ai-titles">
          <div class="ai-title">Kodex AI</div>
          <div class="ai-sub">Sidebar assistant</div>
        </div>
      </div>
      <div class="ai-actions">
        <button id="ai-refresh-summary" class="icon" title="Refresh summary">⟳</button>
        <button id="ai-toggle" class="icon" aria-label="Toggle">‹</button>
      </div>
    </div>
    <div class="ai-body">
      <section class="ai-section ai-summary">
        <h4>Summary</h4>
        <div id="ai-summary" class="ai-box">(summarizing...)</div>
        <button id="ai-summary-expand" class="ghost">Expand</button>
      </section>

      <section class="ai-section ai-visits">
        <h4>Visits</h4>
        <div id="ai-visits" class="ai-visits-list">No visits yet — click links to add</div>
      </section>

      <section class="ai-section ai-tasks">
        <h4>Tasks</h4>
        <div class="task-row">
          <select id="ai-task-type">
            <option value="essay">Write essay</option>
            <option value="analyze_image">Analyze image</option>
            <option value="summarize">Summarize page</option>
          </select>
          <button id="ai-run-task" class="primary">Run</button>
        </div>
        <textarea id="ai-task-payload" placeholder="Instructions / image URL" rows="4"></textarea>
        <div id="ai-task-result" class="ai-box ai-result">No results yet</div>
      </section>
    </div>
  `;
  document.body.appendChild(sidebar);

  // Stylish CSS
  const style = document.createElement('style');
  style.innerHTML = `
    :root{
      --ai-width:320px;
      --bg: #ffffff;
      --muted: #6b7280;
      --accent: linear-gradient(90deg,#6EE7B7,#3B82F6);
      --glass: rgba(255,255,255,0.7);
      --card: #f8fafc;
      --primary: #2563eb;
      --shadow: 0 8px 24px rgba(15,23,42,0.08);
      --radius:12px;
    }
    #kodex-ai-sidebar.kodex-ai{ position: fixed; right: 18px; top: 18px; width: var(--ai-width); height: calc(100vh - 36px); background: var(--bg); box-shadow: var(--shadow); border-radius: var(--radius); z-index: 999999; font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; display:flex; flex-direction:column; overflow:hidden; transition: transform .22s ease, width .22s ease; }
    #kodex-ai-sidebar.collapsed{ transform: translateX(calc(var(--ai-width) - 48px)); width:48px; }
    .ai-header{ display:flex; align-items:center; justify-content:space-between; padding:12px 14px; border-bottom:1px solid #eef2ff; }
    .ai-left{ display:flex; align-items:center; gap:10px; }
    .ai-avatar svg{ width:44px; height:44px; border-radius:10px; }
    .ai-titles{ line-height:1; }
    .ai-title{ font-weight:700; font-size:15px; color:#0f172a; }
    .ai-sub{ font-size:12px; color:var(--muted); }
    .ai-actions{ display:flex; gap:6px; align-items:center; }
    .icon{ background:transparent; border:0; padding:6px; border-radius:8px; cursor:pointer; color:var(--muted); font-size:14px; }
    .icon:hover{ background:#f1f5f9; color:#0f172a; }
    .ai-body{ padding:12px; overflow:auto; display:flex; flex-direction:column; gap:12px; }
    .ai-section h4{ margin:0 0 8px 0; font-size:13px; color:#0f172a; }
    .ai-box{ background:var(--card); padding:10px; border-radius:10px; color:#0b1220; font-size:13px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.6); }
    .ai-box.ai-result{ min-height:48px; white-space:pre-wrap; }
    .ai-summary .ghost{ margin-top:8px; background:transparent; border:0; color:var(--primary); cursor:pointer; }
    .ai-visits-list{ display:flex; flex-direction:column; gap:8px; }
    .ai-visit-card{ display:flex; align-items:center; justify-content:space-between; gap:8px; padding:8px; background:linear-gradient(180deg, rgba(255,255,255,0.8), rgba(248,250,252,1)); border-radius:10px; box-shadow:0 2px 6px rgba(2,6,23,0.04); }
    .ai-visit-left{ display:flex; gap:8px; align-items:center; }
    .visit-favicon{ width:28px; height:28px; border-radius:6px; background:#eef2ff; display:inline-flex; align-items:center; justify-content:center; font-size:12px; color:#2563eb; }
    .visit-title{ font-size:13px; color:#031125; }
    .visit-actions{ display:flex; gap:6px; }
    .primary{ background:var(--primary); color:#fff; border:0; padding:8px 10px; border-radius:8px; cursor:pointer; }
    select#ai-task-type{ padding:8px; border-radius:8px; border:1px solid #e6edf6; background:#fff; }
    textarea#ai-task-payload{ margin-top:8px; width:100%; padding:10px; border-radius:8px; border:1px solid #e6edf6; font-family:inherit; resize:vertical; }
    .task-row{ display:flex; gap:8px; align-items:center; }
    img.ai-image-preview{ max-width:100%; border-radius:8px; margin-top:8px; box-shadow:0 6px 18px rgba(2,6,23,0.06); }
    @media (max-width:900px){ #kodex-ai-sidebar.kodex-ai{ right:10px; width:300px; } }
  `;
  document.head.appendChild(style);

  // Toggle behavior
  const toggle = document.getElementById('ai-toggle');
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    // rotate toggler
    toggle.textContent = sidebar.classList.contains('collapsed') ? '›' : '‹';
  });
  // Helpers: summarize page text
  function getPageText() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const parts = [];
    let n;
    while ((n = walker.nextNode())) {
      const parent = n.parentElement;
      if (!parent) continue;
      if (['SCRIPT','STYLE','NOSCRIPT','IFRAME'].includes(parent.tagName)) continue;
      const t = n.textContent.trim();
      if (t.length > 20) parts.push(t);
    }
    return parts.join(' ');
  }

  function summarize(text, maxWords = 80) {
    if (!text || text.length < 20) return '(no visible text on page)';
    const words = text.split(/\s+/).slice(0, maxWords);
    return words.join(' ') + (words.length >= maxWords ? '...' : '');
  }

  function refreshSummary() {
    const s = document.getElementById('ai-summary');
    s.textContent = 'Summarizing...';
    setTimeout(() => {
      const text = getPageText();
      s.textContent = summarize(text, 120);
    }, 100);
  }

  refreshSummary();
  document.getElementById('ai-refresh-summary').addEventListener('click', refreshSummary);

  // Visits management (simulate multi-visit slots)
  const visits = [];
  const visitsDiv = document.getElementById('ai-visits');

  function renderVisits() {
    if (visits.length === 0) { visitsDiv.innerHTML = 'No visits yet — click links to add'; return; }
    visitsDiv.innerHTML = '';
    visits.forEach((v, i) => {
      const card = document.createElement('div');
      card.className = 'ai-visit-card';
      const left = document.createElement('div');
      left.className = 'ai-visit-left';
      const fav = document.createElement('div'); fav.className = 'visit-favicon'; fav.textContent = (v.title||'').slice(0,1).toUpperCase();
      const title = document.createElement('div'); title.className = 'visit-title'; title.textContent = v.title || v.url;
      left.appendChild(fav); left.appendChild(title);
      const actions = document.createElement('div'); actions.className = 'visit-actions';
      const openBtn = document.createElement('button'); openBtn.className = 'icon'; openBtn.textContent = '↗'; openBtn.title = 'Open in new tab';
      openBtn.addEventListener('click', () => window.open(v.url, '_blank'));
      actions.appendChild(openBtn);
      card.appendChild(left); card.appendChild(actions);
      visitsDiv.appendChild(card);
    });
  }

  function addVisit(url, title) {
    if (!visits.some(x => x.url === url)) {
      visits.push({url, title});
      renderVisits();
    }
  }

  // simple link collector - allow user to add a link as a visit
  document.body.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a');
    if (a && a.href) {
      addVisit(a.href, a.textContent.trim() || a.href.split('/').pop());
    }
  }, true);

  // Task runner (calls backend /api/task if available, otherwise mock)
  const runBtn = document.getElementById('ai-run-task');
  runBtn.addEventListener('click', async () => {
    const type = document.getElementById('ai-task-type').value;
    const payloadEl = document.getElementById('ai-task-payload');
    const payload = payloadEl.value.trim();
    const resultDiv = document.getElementById('ai-task-result');
    resultDiv.innerHTML = '<em>Running…</em>';

    const body = { type, payload, page: window.location.href };

    try {
      const resp = await fetch('/api/task', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
      if (resp.ok) {
        const data = await resp.json();
        if (type === 'analyze_image') {
          // show image preview and analysis
          const img = document.createElement('img'); img.className = 'ai-image-preview'; img.src = payload || '';
          resultDiv.innerHTML = '';
          if (payload) resultDiv.appendChild(img);
          const pre = document.createElement('div'); pre.style.marginTop = '8px'; pre.textContent = data.result || '(no result)';
          resultDiv.appendChild(pre);
        } else {
          resultDiv.textContent = data.result || JSON.stringify(data);
        }
      } else {
        resultDiv.textContent = 'Server returned ' + resp.status;
      }
    } catch (e) {
      // fallback mock behaviors
      if (type === 'essay') {
        resultDiv.textContent = 'Essay (mock):\n' + (payload || 'A short essay about the topic.') + '\n\n(Replace with real AI backend)';
      } else if (type === 'analyze_image') {
        resultDiv.innerHTML = '';
        if (payload) {
          const img = document.createElement('img'); img.className = 'ai-image-preview'; img.src = payload; resultDiv.appendChild(img);
        }
        const p = document.createElement('div'); p.style.marginTop = '8px'; p.textContent = 'Image analysis (mock): Detected objects: cat, tree (example). Provide a more specific image URL for better results.';
        resultDiv.appendChild(p);
      } else if (type === 'summarize') {
        resultDiv.textContent = 'Summary (local):\n' + summarize(getPageText(), 300);
      } else {
        resultDiv.textContent = 'No backend and unknown task.';
      }
    }
  });

  // expose minimal API for compatibility
  window.KodexAI = {
    addVisit: addVisit,
    summarizePage: () => summarize(getPageText(), 300),
    runTask: async (type, payload) => {
      const resp = await fetch('/api/task', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({type, payload, page: window.location.href}) });
      return resp.json();
    }
  };

});
