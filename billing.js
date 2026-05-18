/* ── billing.js ── */

// ── DATA ─────────────────────────────────────────────────

const QUOTATIONS = [
  { client:"Krimay Solutions LTD PVT",  project:"Krimay Website",         quote:"QT26030022", amount:"₹45,500", date:"19 Mar 2026", status:"convert" },
  { client:"Saasi Accady LTD PVT",      project:"Earthi Naturals website", quote:"QT26030021", amount:"₹20,000", date:"18 Mar 2026", status:"sent"    },
  { client:"Sruthi Technologies",        project:"Comaas",                  quote:"QT26030020", amount:"₹21,050", date:"17 Mar 2026", status:"convert" },
  { client:"Chessebank",                 project:"chesse website",          quote:"QT26030019", amount:"₹54,000", date:"16 Mar 2026", status:"convert" },
  { client:"Captial Fortunes",           project:"CF Website",              quote:"QT26030018", amount:"₹50,000", date:"16 Mar 2026", status:"sent"    },
  { client:"Captial Fortunes",           project:"Raphsady Website",        quote:"QT26030017", amount:"₹12,000", date:"16 Mar 2026", status:"sent"    },
  { client:"Sruthi Technologies",        project:"Comaas",                  quote:"QT26030020", amount:"₹21,050", date:"17 Mar 2026", status:"convert" },
  { client:"Chessebank",                 project:"chesse website",          quote:"QT26030019", amount:"₹54,000", date:"16 Mar 2026", status:"sent"    },
  { client:"Captial Fortunes",           project:"CF Website",              quote:"QT26030018", amount:"₹50,000", date:"16 Mar 2026", status:"sent"    },
  { client:"Captial Fortunes",           project:"Raphsady Website",        quote:"QT26030017", amount:"₹12,000", date:"16 Mar 2026", status:"convert" },
  { client:"Krimay Solutions LTD PVT",  project:"Krimay Website",         quote:"QT26030022", amount:"₹45,500", date:"19 Mar 2026", status:"convert" },
  { client:"Saasi Accady LTD PVT",      project:"Earthi Naturals website", quote:"QT26030021", amount:"₹20,000", date:"18 Mar 2026", status:"sent"    },
];

const INVOICES = [
  { inv:"INV26030022", client:"Krimay Solutions LTD PVT",  project:"Krimay Website",          amount:"₹45,500", paid:"₹45,500", date:"19 Mar 2026" },
  { inv:"INV26030021", client:"Saasi Accady LTD PVT",      project:"Earthi Naturals website",  amount:"₹20,000", paid:"₹20,000", date:"18 Mar 2026" },
  { inv:"INV26030020", client:"Sruthi Technologies",        project:"Comaas",                   amount:"₹21,050", paid:"₹21,050", date:"17 Mar 2026" },
  { inv:"INV26030019", client:"Chessebank",                 project:"chesse website",           amount:"₹54,000", paid:"₹54,000", date:"16 Mar 2026" },
  { inv:"INV26030018", client:"Captial Fortunes",           project:"CF Website",               amount:"₹50,000", paid:"₹50,000", date:"16 Mar 2026" },
  { inv:"INV26030017", client:"Captial Fortunes",           project:"Raphsady Website",         amount:"₹12,000", paid:"₹12,000", date:"16 Mar 2026" },
  { inv:"INV26030020", client:"Sruthi Technologies",        project:"Comaas",                   amount:"₹21,050", paid:"₹21,050", date:"17 Mar 2026" },
  { inv:"INV26030019", client:"Chessebank",                 project:"chesse website",           amount:"₹54,000", paid:"₹54,000", date:"16 Mar 2026" },
  { inv:"INV26030018", client:"Captial Fortunes",           project:"CF Website",               amount:"₹50,000", paid:"₹50,000", date:"16 Mar 2026" },
  { inv:"INV26030017", client:"Captial Fortunes",           project:"Raphsady Website",         amount:"₹12,000", paid:"₹12,000", date:"16 Mar 2026" },
  { inv:"INV26030022", client:"Krimay Solutions LTD PVT",  project:"Krimay Website",          amount:"₹45,500", paid:"₹45,500", date:"19 Mar 2026" },
  { inv:"INV26030021", client:"Saasi Accady LTD PVT",      project:"Earthi Naturals website",  amount:"₹20,000", paid:"₹20,000", date:"18 Mar 2026" },
];

const ROWS_PER_PAGE = 10;
let quotePage = 1;
let invoicePage = 1;
let activeDropdownBtn = null;

// ── SVG ICONS ─────────────────────────────────────────────

const eyeSVG = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
</svg>`;

const downloadSVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
  <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
</svg>`;

const dotsSVG = `<span style="letter-spacing:1px;font-size:16px;">⋮</span>`;

// ── RENDER QUOTATIONS ─────────────────────────────────────

function renderQuotations() {
  const tbody = document.getElementById('quotations-body');
  const total = Math.ceil(QUOTATIONS.length / ROWS_PER_PAGE);
  const slice = QUOTATIONS.slice((quotePage-1)*ROWS_PER_PAGE, quotePage*ROWS_PER_PAGE);

  tbody.innerHTML = slice.map((r, i) => `
    <tr>
      <td><span class="client-name">${r.client}</span></td>
      <td>${r.project}</td>
      <td class="quote-num">${r.quote}</td>
      <td class="amount-val">${r.amount}</td>
      <td>${r.date}</td>
      <td>
        <div class="row-actions">
          ${r.status === 'convert'
            ? `<button class="badge-convert">Convert</button>`
            : `<span class="badge-sent">Sent</span>`
          }
          <button class="act-btn" title="View">${eyeSVG}</button>
          <button class="act-btn" title="Download">${downloadSVG}</button>
          <button class="dots-btn" title="More" data-idx="${i + (quotePage-1)*ROWS_PER_PAGE}">${dotsSVG}</button>
        </div>
      </td>
    </tr>
  `).join('');

  // Attach three-dot listeners
  tbody.querySelectorAll('.dots-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showDropdown(btn);
    });
  });

  renderPagination('quotations-pagination', quotePage, total, (p) => {
    quotePage = p;
    renderQuotations();
  });
}

// ── RENDER INVOICES ───────────────────────────────────────

function renderInvoices() {
  const tbody = document.getElementById('invoices-body');
  const total = Math.ceil(INVOICES.length / ROWS_PER_PAGE);
  const slice = INVOICES.slice((invoicePage-1)*ROWS_PER_PAGE, invoicePage*ROWS_PER_PAGE);

  tbody.innerHTML = slice.map((r, i) => `
    <tr>
      <td class="quote-num">${r.inv}</td>
      <td><span class="client-name">${r.client}</span></td>
      <td>${r.project}</td>
      <td class="amount-val">${r.amount}</td>
      <td class="paid-val">${r.paid}</td>
      <td>${r.date}</td>
      <td>
        <div class="row-actions">
          <button class="act-btn" title="View">${eyeSVG}</button>
          <button class="act-btn" title="Download">${downloadSVG}</button>
          <button class="dots-btn" title="More" data-idx="${i + (invoicePage-1)*ROWS_PER_PAGE}">${dotsSVG}</button>
        </div>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('.dots-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      showDropdown(btn);
    });
  });

  renderPagination('invoices-pagination', invoicePage, total, (p) => {
    invoicePage = p;
    renderInvoices();
  });
}

// ── PAGINATION ────────────────────────────────────────────

function renderPagination(containerId, current, total, onChange) {
  const container = document.getElementById(containerId);
  const pages = new Set([1]);
  if (current > 2) pages.add(current - 1);
  pages.add(current);
  if (current < total - 1) pages.add(current + 1);
  pages.add(total);
  const sorted = [...pages].sort((a,b)=>a-b);

  let html = `<button class="pg-btn" ${current===1?'disabled':''} data-p="${current-1}">‹</button>`;
  let prev = 0;
  sorted.forEach(p => {
    if (p - prev > 1) html += `<span class="pg-dots">...</span>`;
    html += `<button class="pg-btn ${p===current?'active':''}" data-p="${p}">${p}</button>`;
    prev = p;
  });
  html += `<button class="pg-btn" ${current===total?'disabled':''} data-p="${current+1}">›</button>`;

  container.innerHTML = html;
  container.querySelectorAll('.pg-btn[data-p]').forEach(btn => {
    btn.addEventListener('click', () => {
      const p = parseInt(btn.dataset.p);
      if (p >= 1 && p <= total) onChange(p);
    });
  });
}

// ── DROPDOWN ──────────────────────────────────────────────

const dropdownMenu = document.getElementById('dropdownMenu');

function showDropdown(btn) {
  if (activeDropdownBtn === btn) {
    hideDropdown();
    return;
  }
  activeDropdownBtn = btn;
  const rect = btn.getBoundingClientRect();
  dropdownMenu.style.top  = (rect.bottom + window.scrollY + 4) + 'px';
  dropdownMenu.style.left = (rect.right + window.scrollX - 160) + 'px';
  dropdownMenu.classList.remove('hidden');
}

function hideDropdown() {
  dropdownMenu.classList.add('hidden');
  activeDropdownBtn = null;
}

document.addEventListener('click', (e) => {
  if (!dropdownMenu.contains(e.target)) hideDropdown();
});

dropdownMenu.querySelectorAll('.dropdown-item').forEach(item => {
  item.addEventListener('click', () => hideDropdown());
});

// ── TABS ─────────────────────────────────────────────────

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    tab.classList.add('active');
    document.getElementById(`panel-${tab.dataset.tab}`).classList.remove('hidden');
    hideDropdown();
  });
});

// ── SEARCH ───────────────────────────────────────────────

document.querySelector('.search-input').addEventListener('input', function() {
  const q = this.value.toLowerCase();
  document.querySelectorAll('.data-table tbody tr').forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(q) ? '' : 'none';
  });
});

// ── INIT ─────────────────────────────────────────────────
renderQuotations();
renderInvoices();