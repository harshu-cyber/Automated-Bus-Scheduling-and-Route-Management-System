/* ═══════════════════════════════════════════════════
   SHARED ROUTE CARDS & STOPPAGES JS
   Used by: Admin, Driver, Depot Manager, Passenger
   
   Usage:
     RouteCards.render(containerId, routes, { editable: true/false })
     RouteCards.showStops(routeMongoId)
═══════════════════════════════════════════════════ */

const RouteCards = (() => {
    let _cache = [];

    // Status badge helper
    function statusBadge(status) {
        const s = (status || '').toLowerCase();
        let cls = 'badge-green';
        if (s.includes('maintenance')) cls = 'badge-yellow';
        if (s.includes('inactive')) cls = 'badge-red';
        return `<span class="badge ${cls}">${status}</span>`;
    }

    // Render route cards into a container
    function render(containerId, routes, options = {}) {
        const { editable = false } = options;
        _cache = routes;
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!routes || !routes.length) {
            container.innerHTML = '<div style="text-align:center; padding:40px; color:#64748b;">No routes found.</div>';
            return;
        }

        container.innerHTML = routes.map(r => `
            <div class="route-card" onclick="RouteCards.showStops('${r._id}')">
                ${editable ? `
                    <div class="route-card-actions">
                        <button class="btn-edit" onclick="event.stopPropagation(); editRoute('${r._id}')"><i class="fas fa-edit"></i></button>
                        <button class="btn-del" onclick="event.stopPropagation(); deleteRoute('${r._id}')"><i class="fas fa-trash"></i></button>
                    </div>
                ` : ''}
                <div class="route-card-header">
                    <span class="route-card-id">${r.routeId}</span>
                    <span class="route-card-depot"><i class="fas fa-warehouse" style="margin-right:4px;"></i>${r.depot || 'Unassigned'}</span>
                </div>
                <div class="route-card-name">${r.name}</div>
                <div class="route-card-endpoints">
                    <div class="route-endpoint">
                        <div class="route-endpoint-label">From</div>
                        <div class="route-endpoint-name">${r.startPoint || '—'}</div>
                    </div>
                    <span class="route-endpoint-arrow"><i class="fas fa-arrow-right"></i></span>
                    <div class="route-endpoint">
                        <div class="route-endpoint-label">To</div>
                        <div class="route-endpoint-name">${r.endPoint || '—'}</div>
                    </div>
                </div>
                <div class="route-card-meta">
                    <span><i class="fas fa-map-pin"></i>${r.stops} Stops</span>
                    <span><i class="fas fa-road"></i>${r.distance} km</span>
                    <span>${statusBadge(r.status)}</span>
                </div>
                <div class="route-card-hint">Click to view stoppages</div>
            </div>
        `).join('');
    }

    // Show stoppages modal
    function showStops(routeMongoId) {
        const route = _cache.find(r => r._id === routeMongoId);
        if (!route) return;

        // Ensure modal exists, or create one dynamically
        let modal = document.getElementById('stopsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.id = 'stopsModal';
            modal.innerHTML = `
                <div class="modal stops-modal-content">
                    <div class="modal-header">
                        <h3>Route Stoppages</h3>
                        <button class="modal-close" onclick="RouteCards.closeStopsModal()"><i class="fas fa-times"></i></button>
                    </div>
                    <div class="modal-body" id="stopsModalBody"></div>
                </div>
            `;
            document.body.appendChild(modal);
            // Close on overlay click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) RouteCards.closeStopsModal();
            });
        }

        const body = document.getElementById('stopsModalBody');
        const stops = route.stopNames || [];

        body.innerHTML = `
            <div class="stops-route-title">${route.name}</div>
            <div class="stops-route-meta">
                <span><i class="fas fa-hashtag" style="margin-right:4px;"></i>${route.routeId}</span>
                <span><i class="fas fa-map-pin" style="margin-right:4px;"></i>${route.stops} stops</span>
                <span><i class="fas fa-road" style="margin-right:4px;"></i>${route.distance} km</span>
                <span><i class="fas fa-warehouse" style="margin-right:4px;"></i>${route.depot || 'N/A'}</span>
            </div>
            ${stops.length ? `
                <div class="stops-timeline">
                    ${stops.map((s, i) => `
                        <div class="stop-item">
                            <span class="stop-dot"></span>
                            <span class="stop-number">${String(i + 1).padStart(2, '0')}</span>
                            <span class="stop-name">${s}</span>
                        </div>
                    `).join('')}
                </div>
            ` : `
                <div style="text-align:center; padding:30px; color:#64748b;">
                    <i class="fas fa-info-circle" style="font-size:24px; margin-bottom:8px; display:block;"></i>
                    No stoppages data available for this route.
                </div>
            `}
        `;

        modal.classList.add('open');
    }

    function closeStopsModal() {
        const modal = document.getElementById('stopsModal');
        if (modal) modal.classList.remove('open');
    }

    return { render, showStops, closeStopsModal, getCache: () => _cache };
})();
