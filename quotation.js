/* ── quotation.js ── */

const TAX_RATE = 0.18;

// ── FORMAT INR ────────────────────────────────────────────
function formatINR(num) {
  const n = Math.round(num);
  if (n === 0) return '₹0';
  let s = n.toString();
  let result = s.slice(-3);
  s = s.slice(0, -3);
  while (s.length > 2) { result = s.slice(-2) + ',' + result; s = s.slice(0, -2); }
  return '₹' + (s ? s + ',' : '') + result;
}

// ── RECALCULATE ROW AMOUNTS ───────────────────────────────
function recalcRows() {
  document.querySelectorAll('#serviceRows .service-row').forEach(row => {
    const qty  = parseFloat(row.querySelector('.qty-input').value)  || 0;
    const rate = parseFloat(row.querySelector('.rate-input').value) || 0;
    const amt  = qty * rate;
    row.querySelector('.amt-input').value = amt;
  });
  recalcSummary();
}

// ── RECALCULATE SUMMARY ───────────────────────────────────
function recalcSummary() {
  let subtotal = 0;
  document.querySelectorAll('#serviceRows .amt-input').forEach(inp => {
    subtotal += parseFloat(inp.value) || 0;
  });

  const discType  = document.getElementById('discountType').value;
  const discVal   = parseFloat(document.getElementById('discountInput').value) || 0;
  let discAmt     = discType === 'percent' ? (subtotal * discVal / 100) : discVal;
  const afterDisc = subtotal - discAmt;
  const taxAmt    = afterDisc * TAX_RATE;
  const total     = afterDisc + taxAmt;

  const discLabel = discType === 'percent' ? `Discount(${discVal}%)` : 'Discount(₹)';
  document.querySelector('.pricing-row:nth-child(2) .pricing-label').textContent = discLabel;

  document.getElementById('subtotalDisplay').textContent = formatINR(subtotal);
  document.getElementById('discountDisplay').textContent = discAmt > 0 ? `-${formatINR(discAmt)}` : '₹0';
  document.getElementById('taxDisplay').textContent      = formatINR(taxAmt);
  document.getElementById('totalDisplay').textContent    = formatINR(total);
}

// ── DELETE ROW ────────────────────────────────────────────
function attachDelListeners() {
  document.querySelectorAll('.del-row-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const rows = document.querySelectorAll('#serviceRows .service-row');
      if (rows.length > 1) {
        btn.closest('.service-row').remove();
        recalcSummary();
      }
    });
  });
}

// ── ADD ROW ───────────────────────────────────────────────
document.getElementById('addRowBtn').addEventListener('click', () => {
  const tbody = document.getElementById('serviceRows');
  const tr = document.createElement('tr');
  tr.className = 'service-row';
  tr.innerHTML = `
    <td><input type="text" class="svc-input" placeholder="Enter service"/></td>
    <td><input type="text" class="svc-input" placeholder="Enter description"/></td>
    <td><input type="number" class="svc-input qty-input" value="0" min="0"/></td>
    <td>
      <div class="rupee-cell">
        <span class="rupee-pre">₹</span>
        <input type="number" class="svc-input rate-input" value="0" min="0"/>
      </div>
    </td>
    <td>
      <div class="rupee-cell">
        <span class="rupee-pre">₹</span>
        <input type="number" class="svc-input amt-input" value="0" readonly/>
      </div>
    </td>
    <td>
      <button class="del-row-btn" title="Delete">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
          <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
        </svg>
      </button>
    </td>`;
  tbody.appendChild(tr);

  // Live listeners for new row
  tr.querySelector('.qty-input').addEventListener('input', recalcRows);
  tr.querySelector('.rate-input').addEventListener('input', recalcRows);
  attachDelListeners();
});

// ── LIVE LISTENERS ────────────────────────────────────────
document.querySelectorAll('.qty-input, .rate-input').forEach(inp => {
  inp.addEventListener('input', recalcRows);
});

document.getElementById('discountInput').addEventListener('input', recalcSummary);
document.getElementById('discountType').addEventListener('change', recalcSummary);

// ── INIT ─────────────────────────────────────────────────
attachDelListeners();
recalcSummary();

// ── RADIO: NEW vs EXISTED CLIENT ─────────────────────────
document.querySelectorAll('input[name="clientType"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const isNew = radio.value === 'new';
    document.getElementById('existedClientSection').classList.toggle('hidden', isNew);
    document.getElementById('newClientSection').classList.toggle('hidden', !isNew);
  });
});

// ── CALENDAR ─────────────────────────────────────────────
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Mo','Tu','We','Th','Fr','Sa','Su'];

let calState = {}; // { calId: { year, month, selectedDate, mode, inputId } }

function parseInputDate(val) {
  if (!val) return null;
  const parts = val.split('/');
  if (parts.length === 3) return new Date(parseInt(parts[2]), parseInt(parts[1])-1, parseInt(parts[0]));
  return null;
}

function formatDate(d) {
  const dd = String(d.getDate()).padStart(2,'0');
  const mm = String(d.getMonth()+1).padStart(2,'0');
  return `${dd}/${mm}/${d.getFullYear()}`;
}

function buildCalendar(calId) {
  const state = calState[calId];
  const popup = document.getElementById(calId);
  const today = new Date();
  const { year, month, selectedDate, mode } = state;

  if (mode === 'month') {
    // Month picker
    let html = `<div class="cal-header">
      <span class="cal-month-label" data-action="year" data-cal="${calId}">${year} ▾</span>
      <div class="cal-nav-btns">
        <button class="cal-nav-btn" data-action="prev-year" data-cal="${calId}">↑</button>
        <button class="cal-nav-btn" data-action="next-year" data-cal="${calId}">↓</button>
      </div>
    </div>
    <div class="cal-picker">`;
    MONTHS_SHORT.forEach((m, i) => {
      const isSel = selectedDate && selectedDate.getMonth() === i && selectedDate.getFullYear() === year;
      html += `<div class="cal-pick-item${isSel?' selected':''}" data-action="pick-month" data-month="${i}" data-cal="${calId}">${m}</div>`;
    });
    html += `</div>`;
    popup.innerHTML = html;

  } else if (mode === 'year') {
    // Year list
    const startY = year - 4;
    let html = `<div class="cal-header">
      <span class="cal-month-label">Select Year</span>
    </div><div class="cal-year-list">`;
    for (let y = startY; y <= startY + 10; y++) {
      const isSel = selectedDate && selectedDate.getFullYear() === y;
      html += `<div class="cal-year-item${isSel?' selected':''}" data-action="pick-year" data-year="${y}" data-cal="${calId}">${y}</div>`;
    }
    html += `</div>`;
    popup.innerHTML = html;

  } else {
    // Day grid
    const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const daysInPrev  = new Date(year, month, 0).getDate();
    // Convert Sun=0 to Mon=0
    let startOffset = (firstDay === 0) ? 6 : firstDay - 1;

    let html = `<div class="cal-header">
      <span class="cal-month-label" data-action="month" data-cal="${calId}">${MONTHS[month]}, ${year} ▾</span>
      <div class="cal-nav-btns">
        <button class="cal-nav-btn" data-action="prev" data-cal="${calId}">↑</button>
        <button class="cal-nav-btn" data-action="next" data-cal="${calId}">↓</button>
      </div>
    </div>
    <div class="cal-grid">`;

    DAYS.forEach(d => { html += `<div class="cal-dow">${d}</div>`; });

    // Prev month days
    for (let i = startOffset - 1; i >= 0; i--) {
      html += `<div class="cal-day other-month">${daysInPrev - i}</div>`;
    }
    // Current month days
    for (let d = 1; d <= daysInMonth; d++) {
      const isToday = today.getDate()===d && today.getMonth()===month && today.getFullYear()===year;
      const isSel = selectedDate && selectedDate.getDate()===d && selectedDate.getMonth()===month && selectedDate.getFullYear()===year;
      let cls = 'cal-day';
      if (isToday) cls += ' today';
      if (isSel)   cls += ' selected';
      html += `<div class="${cls}" data-action="pick-day" data-day="${d}" data-cal="${calId}">${d}</div>`;
    }
    // Next month fill
    const total = startOffset + daysInMonth;
    const remaining = (7 - (total % 7)) % 7;
    for (let d = 1; d <= remaining; d++) {
      html += `<div class="cal-day other-month">${d}</div>`;
    }

    html += `</div>
    <div class="cal-footer">
      <button class="cal-footer-btn" data-action="clear" data-cal="${calId}">Clear</button>
      <button class="cal-footer-btn" data-action="today" data-cal="${calId}">Today</button>
    </div>`;
    popup.innerHTML = html;
  }

  // Attach events
  popup.querySelectorAll('[data-action]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      handleCalAction(el.dataset.action, el.dataset, calId);
    });
  });
}

function handleCalAction(action, data, calId) {
  const state = calState[calId];
  if (action === 'prev') {
    state.month--;
    if (state.month < 0) { state.month = 11; state.year--; }
    state.mode = 'day';
  } else if (action === 'next') {
    state.month++;
    if (state.month > 11) { state.month = 0; state.year++; }
    state.mode = 'day';
  } else if (action === 'prev-year') {
    state.year--;
  } else if (action === 'next-year') {
    state.year++;
  } else if (action === 'month') {
    state.mode = 'month';
  } else if (action === 'year') {
    state.mode = 'year';
  } else if (action === 'pick-month') {
    state.month = parseInt(data.month);
    state.mode = 'day';
  } else if (action === 'pick-year') {
    state.year = parseInt(data.year);
    state.mode = 'month';
  } else if (action === 'pick-day') {
    const d = parseInt(data.day);
    state.selectedDate = new Date(state.year, state.month, d);
    document.getElementById(state.inputId).value = formatDate(state.selectedDate);
    closeAllCals();
    return;
  } else if (action === 'clear') {
    state.selectedDate = null;
    document.getElementById(state.inputId).value = '';
    closeAllCals();
    return;
  } else if (action === 'today') {
    const t = new Date();
    state.selectedDate = t;
    state.year = t.getFullYear();
    state.month = t.getMonth();
    document.getElementById(state.inputId).value = formatDate(t);
    closeAllCals();
    return;
  }
  buildCalendar(calId);
}

function closeAllCals() {
  document.querySelectorAll('.calendar-popup').forEach(p => p.classList.add('hidden'));
}

// Init calendar triggers
document.querySelectorAll('.date-trigger').forEach(trigger => {
  trigger.style.cursor = 'pointer';
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const calId = trigger.dataset.cal;
    const inputId = trigger.dataset.target;
    const popup = document.getElementById(calId);

    // Close others
    document.querySelectorAll('.calendar-popup').forEach(p => {
      if (p.id !== calId) p.classList.add('hidden');
    });

    if (!popup.classList.contains('hidden')) {
      popup.classList.add('hidden');
      return;
    }

    // Init state
    const existingVal = document.getElementById(inputId).value;
    const parsed = parseInputDate(existingVal);
    const ref = parsed || new Date();
    calState[calId] = {
      year: ref.getFullYear(),
      month: ref.getMonth(),
      selectedDate: parsed,
      mode: 'day',
      inputId
    };
    buildCalendar(calId);
    popup.classList.remove('hidden');
  });
});

// Also trigger on clicking the input itself
document.querySelectorAll('.date-input').forEach(input => {
  input.addEventListener('click', (e) => {
    e.stopPropagation();
    const trigger = input.parentElement.querySelector('.date-trigger');
    if (trigger) trigger.click();
  });
});

// Close on outside click
document.addEventListener('click', closeAllCals);

// ── EDIT TOGGLE ───────────────────────────────────────────

function toggleEdit(section) {
  if (section === 'note') {
    const view = document.getElementById('note-view');
    const edit = document.getElementById('note-edit');
    const btn  = document.getElementById('note-btn-txt');
    const isEditing = !edit.classList.contains('hidden');
    if (isEditing) {
      // Save
      view.textContent = edit.value;
      edit.classList.add('hidden');
      view.classList.remove('hidden');
      btn.textContent = 'Edit';
    } else {
      // Open edit
      edit.value = view.textContent;
      edit.classList.remove('hidden');
      view.classList.add('hidden');
      btn.textContent = 'Save';
      edit.focus();
    }
  }

  if (section === 'bank') {
    const view = document.getElementById('bank-view');
    const edit = document.getElementById('bank-edit');
    const btn  = document.getElementById('bank-btn-txt');
    const isEditing = !edit.classList.contains('hidden');
    if (isEditing) {
      saveBank();
    } else {
      view.classList.add('hidden');
      edit.classList.remove('hidden');
      btn.textContent = 'Save';
    }
  }

  if (section === 'terms') {
    const view = document.getElementById('terms-view');
    const edit = document.getElementById('terms-edit');
    const btn  = document.getElementById('terms-btn-txt');
    const isEditing = !edit.classList.contains('hidden');
    if (isEditing) {
      // Save - convert numbered lines back to list items
      const lines = edit.value.split('\n').filter(l => l.trim());
      view.innerHTML = lines.map(l => `<li>${l.replace(/^\d+\.\s*/, '')}</li>`).join('');
      edit.classList.add('hidden');
      view.classList.remove('hidden');
      btn.textContent = 'Edit';
    } else {
      edit.classList.remove('hidden');
      view.classList.add('hidden');
      btn.textContent = 'Save';
      edit.focus();
    }
  }
}

function saveBank() {
  document.getElementById('bv-name').textContent   = document.getElementById('be-name').value;
  document.getElementById('bv-holder').textContent = document.getElementById('be-holder').value;
  document.getElementById('bv-acc').textContent    = document.getElementById('be-acc').value;
  document.getElementById('bv-ifsc').textContent   = document.getElementById('be-ifsc').value;
  document.getElementById('bv-type').textContent   = document.getElementById('be-type').value;
  document.getElementById('bank-view').classList.remove('hidden');
  document.getElementById('bank-edit').classList.add('hidden');
  document.getElementById('bank-btn-txt').textContent = 'Edit';
}

function cancelEdit(section) {
  if (section === 'bank') {
    document.getElementById('bank-view').classList.remove('hidden');
    document.getElementById('bank-edit').classList.add('hidden');
    document.getElementById('bank-btn-txt').textContent = 'Edit';
  }
}

// ── SIGNATURE UPLOAD ──────────────────────────────────────
function triggerSignatureUpload() {
  document.getElementById('sigUpload').click();
}

function previewSignature(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    const box = document.querySelector('.signature-img-wrap');
    box.innerHTML = `<img src="${e.target.result}" style="width:160px;height:90px;object-fit:contain;border-radius:6px;display:block;background:#f0efec;"/>`;
  };
  reader.readAsDataURL(file);
}

// ── MODAL FUNCTIONS ───────────────────────────────────────

function openModal(id) {
  document.getElementById('modalOverlay').classList.remove('hidden');
  document.getElementById(id).classList.remove('hidden');
  // Pre-fill note modal with current value
  if (id === 'noteModal') {
    const cur = document.getElementById('note-view');
    if (cur) document.getElementById('note-modal-input').value = cur.textContent.trim();
  }
  // Pre-fill bank modal with current values
  if (id === 'bankModal') {
    document.getElementById('bm-name').value   = document.getElementById('bv-name')  ?.textContent || '';
    document.getElementById('bm-holder').value = document.getElementById('bv-holder')?.textContent || '';
    document.getElementById('bm-acc').value    = document.getElementById('bv-acc')   ?.textContent || '';
    document.getElementById('bm-ifsc').value   = document.getElementById('bv-ifsc')  ?.textContent || '';
    document.getElementById('bm-type').value   = document.getElementById('bv-type')  ?.textContent || '';
  }
  // Pre-fill terms modal
  if (id === 'termsModal') {
    const items = document.querySelectorAll('#terms-view li');
    const lines = [...items].map((li, i) => `${i+1}. ${li.textContent}`).join('\n');
    document.getElementById('terms-modal-input').value = lines;
  }
}

function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
  document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
}

function saveNote() {
  const val = document.getElementById('note-modal-input').value.trim();
  const view = document.getElementById('note-view');
  if (view) view.textContent = val;
  closeModal();
}

function saveBank() {
  document.getElementById('bv-name').textContent   = document.getElementById('bm-name').value;
  document.getElementById('bv-holder').textContent = document.getElementById('bm-holder').value;
  document.getElementById('bv-acc').textContent    = document.getElementById('bm-acc').value;
  document.getElementById('bv-ifsc').textContent   = document.getElementById('bm-ifsc').value;
  document.getElementById('bv-type').textContent   = document.getElementById('bm-type').value;
  // Also sync inline fields if they exist
  ['be-name','be-holder','be-acc','be-ifsc','be-type'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = document.getElementById('bm-' + id.split('-')[1]).value;
  });
  closeModal();
}

function saveTerms() {
  const lines = document.getElementById('terms-modal-input').value.split('\n').filter(l => l.trim());
  const view = document.getElementById('terms-view');
  if (view) view.innerHTML = lines.map(l => `<li>${l.replace(/^\d+\.\s*/, '')}</li>`).join('');
  closeModal();
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ── CREATE QUOTATION ──────────────────────────────────────

function createQuotation() {
  // Basic validation
  const errors = [];

  // Client type check
  const clientType = document.querySelector('input[name="clientType"]:checked').value;
  if (clientType === 'new') {
    const companyName = document.querySelector('#newClientSection input[type="text"]');
    if (companyName && !companyName.value.trim()) {
      errors.push('Please enter Company/Client name.');
    }
  }

  // Quotation number
  const quoteNum = document.querySelector('input[value="QT -2023 -0987"], .input-field');
  const quoteDateVal = document.getElementById('quoteDate')?.value;
  const dueDateVal   = document.getElementById('dueDate')?.value;

  if (!quoteDateVal || quoteDateVal === '') {
    errors.push('Please select a Quote Date.');
  }
  if (!dueDateVal || dueDateVal === '') {
    errors.push('Please select a Due Date.');
  }

  // Service rows - at least one must have a service name
  const serviceInputs = document.querySelectorAll('#serviceRows .service-row input[type="text"]:first-child');
  let hasService = false;
  document.querySelectorAll('#serviceRows .service-row').forEach(row => {
    const svcName = row.querySelector('input[type="text"]');
    if (svcName && svcName.value.trim()) hasService = true;
  });
  if (!hasService) {
    errors.push('Please add at least one service.');
  }

  if (errors.length > 0) {
    showValidationError(errors);
    return;
  }

  // All good — show success modal
  document.getElementById('successOverlay').classList.remove('hidden');
  document.getElementById('successModal').classList.remove('hidden');
}

function showValidationError(errors) {
  // Remove existing error toast
  const existing = document.getElementById('errorToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'errorToast';
  toast.style.cssText = `
    position:fixed; bottom:28px; left:50%; transform:translateX(-50%);
    background:#fef2f2; border:1.5px solid #fecaca; border-radius:10px;
    padding:14px 20px; z-index:2000; display:flex; align-items:flex-start;
    gap:10px; box-shadow:0 8px 24px rgba(0,0,0,.12); max-width:380px; width:90%;
    animation: slideUp .2s ease;
  `;
  toast.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" style="flex-shrink:0;margin-top:1px">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
    <div>
      ${errors.map(e => `<div style="font-size:13px;color:#dc2626;font-weight:500;line-height:1.5">${e}</div>`).join('')}
    </div>
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function closeSuccessModal() {
  document.getElementById('successOverlay').classList.add('hidden');
  document.getElementById('successModal').classList.add('hidden');
}

// Add slideUp animation
const style = document.createElement('style');
style.textContent = `@keyframes slideUp { from { opacity:0; transform:translateX(-50%) translateY(16px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }`;
document.head.appendChild(style);