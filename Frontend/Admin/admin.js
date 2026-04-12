// ═══════════════════════════════════════════════════
//  DTCSL ADMIN — REFACTORED JAVASCRIPT
// ═══════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
    const page = document.body.dataset.page;
    if (page) initAdminPage(page);
});

async function initAdminPage(page) {
    console.log(`[Admin] Initializing ${page}...`);
    
    switch (page) {
        case 'dashboard': await loadDashboard(); break;
        case 'routes':    await loadRoutes(); break;
        case 'buses':     await loadBuses(); break;
        case 'schedule':  await loadSchedule(); break;
        case 'crew':      await loadCrew(); break;
        case 'depots':    await loadDepots(); break;
    }
}

// ═══════════ STATUS BADGE HELPER ═══════════
function statusBadge(status) {
    const s = (status || '').toLowerCase();
    let cls = 'badge-green';
    if (s.includes('maintenance') || s.includes('off duty') || s.includes('late')) cls = 'badge-yellow';
    if (s.includes('breakdown') || s.includes('retired') || s.includes('inactive') || s.includes('leave')) cls = 'badge-red';
    if (s.includes('active') || s.includes('on duty') || s.includes('on time')) cls = 'badge-green';
    return `<span class="badge ${cls}">${status}</span>`;
}

// ═══════════ DASHBOARD ═══════════
async function loadDashboard() {
    const data = await API.getDashboard();
    if (!data) return;

    const stats = document.querySelectorAll('.stat-num');
    if (stats.length >= 4) {
        stats[0].textContent = data.totalBuses || 0;
        stats[1].textContent = data.activeRoutes || 0;
        stats[2].textContent = data.crewMembers || 0;
        stats[3].textContent = (data.dailyPassengers || 0).toLocaleString();
    }

    const schedule = await API.getSchedule();
    const tbody = document.getElementById('activityBody');
    if (schedule && tbody) {
        tbody.innerHTML = schedule.slice(0, 5).map(s => `
            <tr>
                <td>${s.bus}</td>
                <td>${s.route}</td>
                <td>${s.driver}</td>
                <td><span class="badge badge-green">On Time</span></td>
                <td>${s.time}</td>
            </tr>
        `).join('');
    }
}

// ═══════════ ROUTES ═══════════
async function loadRoutes() {
    const data = await API.getRoutes();
    if (!data) return;
    const tbody = document.querySelector('.data-table tbody');
    tbody.innerHTML = data.map(r => `
        <tr>
            <td>${r.routeId}</td>
            <td>${r.name}</td>
            <td>${r.stops}</td>
            <td>${r.distance} km</td>
            <td><span class="badge badge-green">${r.status}</span></td>
            <td>
                <button class="btn-icon" onclick="editRoute('${r._id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon btn-icon-red" onclick="deleteRoute('${r._id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// ═══════════ BUSES ═══════════
async function loadBuses() {
    const data = await API.getBuses();
    if (!data) return;
    const tbody = document.querySelector('.data-table tbody');
    tbody.innerHTML = data.map(b => `
        <tr>
            <td>${b.regNo}</td>
            <td>${b.type}</td>
            <td>${b.capacity}</td>
            <td>${b.depot}</td>
            <td>${statusBadge(b.status)}</td>
            <td>${new Date(b.lastService).toLocaleDateString()}</td>
            <td>
                <button class="btn-icon" onclick="editBus('${b._id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon btn-icon-red" onclick="deleteBus('${b._id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// ═══════════ SCHEDULE ═══════════
let globalScheduleData = [];
async function loadSchedule() {
    const data = await API.getSchedule();
    if (!data) return;
    globalScheduleData = data;
    const grid = document.querySelector('.schedule-grid');
    // Wrap in scroll container if not already
    let wrapper = grid.parentElement;
    if (!wrapper.classList.contains('schedule-wrapper')) {
        const w = document.createElement('div');
        w.className = 'schedule-wrapper';
        grid.parentNode.insertBefore(w, grid);
        w.appendChild(grid);
    }

    // Flat card layout — no day grouping
    if (!data.length) {
        grid.innerHTML = '<div class="schedule-slot slot-empty" style="grid-column:1/-1; text-align:center; padding:40px;">No scheduled trips. Click "Manual Entry" to add a schedule.</div>';
        return;
    }

    grid.innerHTML = data.map(s => {
        // Format date for display (e.g., "12 Apr 2026")
        const dateDisplay = s.date
            ? new Date(s.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
            : '';
        const dayDate = s.day + (dateDisplay ? `, ${dateDisplay}` : '');
        return `
            <div class="schedule-slot">
                <div class="slot-date-badge">${dayDate}</div>
                <div class="slot-time">${s.time}</div>
                <div class="slot-info">
                    <strong>${s.route}</strong>${s.routeName ? ` — ${s.routeName}` : ''}
                    <br><small><i class="fas fa-bus" style="margin-right:4px;opacity:.6;"></i>${s.bus} &bull; <i class="fas fa-user" style="margin-right:4px;opacity:.6;"></i>${s.driver}</small>
                    <div class="slot-actions" style="margin-top:5px; text-align:right;">
                        <i class="fas fa-edit" style="color:#38bdf8; cursor:pointer; font-size:12px; margin-right:8px;" onclick="editSchedule('${s._id}')"></i>
                        <i class="fas fa-trash" style="color:#ef4444; cursor:pointer; font-size:12px;" onclick="deleteSchedule('${s._id}')"></i>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ═══════════ CREW ═══════════
async function loadCrew() {
    const data = await API.getCrew();
    if (!data) return;
    const tbody = document.querySelector('.data-table tbody');
    tbody.innerHTML = data.map(c => `
        <tr>
            <td>${c.crewId}</td>
            <td>${c.name}</td>
            <td>${c.role}</td>
            <td>${c.phone}</td>
            <td>${c.assignedBus}</td>
            <td>${statusBadge(c.status)}</td>
            <td>
                <button class="btn-icon" onclick="editCrew('${c._id}')"><i class="fas fa-edit"></i></button>
                <button class="btn-icon btn-icon-red" onclick="deleteCrew('${c._id}')"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

// ═══════════ DEPOTS ═══════════
async function loadDepots() {
    const data = await API.getDepots();
    if (!data) return;
    const grid = document.querySelector('.depot-grid');
    grid.innerHTML = data.map(d => `
        <div class="depot-card">
            <h3>${d.name}</h3>
            <p>${d.location}</p>
            <div class="depot-stats">
                <span><b>${d.busCount}</b> Buses</span>
                <span><b>${d.routeCount}</b> Routes</span>
            </div>
            <div class="depot-bar"><div class="depot-fill" style="width:${d.utilization}%"></div></div>
        </div>
    `).join('');
}

// ═══════════════════════════════════════════════════
//  DYNAMIC ACTIONS & MODALS
// ═══════════════════════════════════════════════════

function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { 
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('open'); 
    delete modal.dataset.editId;
    const form = modal.querySelector('form');
    if (form) form.reset();
}

// Generic Delete
async function deleteResource(path, id, reloadFn) {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const res = await API.deleteRes(path, id);
    if (res) { reloadFn(); UI.showAlert('Deleted successfully'); }
}

const deleteRoute = (id) => deleteResource('routes', id, loadRoutes);
const deleteBus = (id) => deleteResource('buses', id, loadBuses);
const deleteCrew = (id) => deleteResource('crew', id, loadCrew);
const deleteSchedule = (id) => deleteResource('schedule', id, loadSchedule);

// Generic Edit (Simplified)
async function editResource(path, id, modalId, fieldMap) {
    const item = await API.fetch(`/${path}/${id}`);
    if (!item) return;
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    Object.keys(fieldMap).forEach(key => {
        const input = modal.querySelector(`#${key}`);
        if (input) input.value = item[fieldMap[key]];
    });
    
    modal.dataset.editId = id;
    openModal(modalId);
}

const editRoute = (id) => editResource('routes', id, 'routeModal', { 'routeId': 'routeId', 'routeName': 'name' });
const editBus = (id) => editResource('buses', id, 'busModal', { 'busReg': 'regNo', 'busType': 'type' });
const editCrew = (id) => editResource('crew', id, 'crewModal', { 'crewName': 'name', 'crewRole': 'role' });
function editSchedule(id) {
    const item = globalScheduleData.find(x => x._id === id);
    if (!item) return;
    const modal = document.getElementById('scheduleModal');
    if (!modal) return;
    document.getElementById('schedDay').value = item.day;
    document.getElementById('schedTime').value = item.time;
    document.getElementById('schedRoute').value = item.route;
    document.getElementById('schedRouteName').value = item.routeName || '';
    document.getElementById('schedBus').value = item.bus;
    document.getElementById('schedDriver').value = item.driver;
    modal.dataset.editId = id;
    openModal('scheduleModal');
}

// Global Click Close
window.onclick = (e) => { if (e.target.classList.contains('modal-overlay')) closeModal(e.target.id); };
// Escape Key Close
window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => closeModal(m.id));
    }
});
