// ═══════════════════════════════════════════════════
//  DTCSL SHARED UI COMPONENTS (Sidebar & Navbar)
// ═══════════════════════════════════════════════════

const UI = {
    // 1. Sidebar HTML based on Role
    getSidebarHTML: (role) => {
        const routes = {
            admin: [
                { name: 'Dashboard', icon: 'fas fa-th-large', link: '../Admin/dashboard.html', id: 'dashboard' },
                { name: 'Route Management', icon: 'fas fa-route', link: '../Admin/routes.html', id: 'routes' },
                { name: 'Bus Management', icon: 'fas fa-bus', link: '../Admin/buses.html', id: 'buses' },
                { name: 'Timetable & Schedule', icon: 'fas fa-calendar-alt', link: '../Admin/schedule.html', id: 'schedule' },
                { name: 'Driver & Conductor', icon: 'fas fa-id-badge', link: '../Admin/crew.html', id: 'crew' },
                { name: 'Depot Management', icon: 'fas fa-warehouse', link: '../Admin/depots.html', id: 'depots' },
                { name: 'Tracking', icon: 'fas fa-map-marked-alt', link: '../Admin/tracking.html', id: 'tracking' },
                { name: 'Profile', icon: 'fas fa-user-cog', link: '../Admin/profile.html', id: 'profile' }
            ],
            depot: [
                { name: 'Depot Dashboard', icon: 'fas fa-warehouse', link: '../DepotManager/index.html', id: 'depot-dashboard' },
                { name: 'Assigned Buses', icon: 'fas fa-bus', link: '../DepotManager/buses.html', id: 'depot-buses' },
                { name: 'Schedules', icon: 'fas fa-calendar-check', link: '../DepotManager/schedules.html', id: 'depot-schedules' },
                { name: 'Profile', icon: 'fas fa-user-cog', link: '../DepotManager/profile.html', id: 'profile' }
            ],
            driver: [
                { name: 'My Trips', icon: 'fas fa-road', link: '../Driver/index.html', id: 'driver-trips' },
                { name: 'Active Duty', icon: 'fas fa-bus-alt', link: '../Driver/duty.html', id: 'driver-duty' },
                { name: 'Profile', icon: 'fas fa-user-cog', link: '../Driver/profile.html', id: 'profile' }
            ],
            passenger: [
                { name: 'Bus Search', icon: 'fas fa-search-location', link: '../Passenger/index.html', id: 'passenger-home' },
                { name: 'Live Tracking', icon: 'fas fa-map-marker-alt', link: '../Passenger/tracking.html', id: 'passenger-tracking' },
                { name: 'My Tickets', icon: 'fas fa-ticket-alt', link: '../Passenger/tickets.html', id: 'passenger-tickets' }
            ]
        };

        const currentRoutes = routes[role] || routes.passenger;
        const currentPage = document.body.dataset.page;

        return `
        <aside class="sidebar" id="sidebar">
            <div class="sidebar-header">
                <div class="logo-icon">
                    <svg viewBox="0 0 24 24"><path d="M4 16c0 .88.39 1.67 1 2.22V20a1 1 0 001 1h1a1 1 0 001-1v-1h8v1a1 1 0 001 1h1a1 1 0 001-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/></svg>
                </div>
                <span class="logo-text">DTCSL</span>
            </div>
            <nav class="sidebar-nav">
                <div class="nav-section-label">Navigation</div>
                ${currentRoutes.map(r => `
                    <a href="${r.link}" class="nav-item ${currentPage === r.id ? 'active' : ''}">
                        <i class="${r.icon}"></i><span>${r.name}</span>
                    </a>
                `).join('')}
            </nav>
            <div class="sidebar-footer">
                <a href="#" class="nav-item logout-btn" id="logoutBtn">
                    <i class="fas fa-sign-out-alt"></i><span>Logout</span>
                </a>
            </div>
        </aside>`;
    },

    // 2. Navbar HTML
    getNavbarHTML: (title) => {
        const user = JSON.parse(localStorage.getItem('dtcsl_user') || '{}');
        const fullName = user.fullName || 'User';
        const role = user.role || 'Passenger';

        return `
        <header class="topbar">
            <div class="topbar-left">
                <button class="sidebar-toggle" id="sidebarToggle"><i class="fas fa-bars"></i></button>
                <h1 class="page-title">${title || 'Dashboard'}</h1>
            </div>
            <div class="topbar-right">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" placeholder="Search...">
                </div>
                <button class="topbar-btn" id="themeToggle"><i class="fas fa-sun"></i></button>
                <button class="topbar-btn"><i class="fas fa-bell"></i><span class="notif-dot"></span></button>
                <div class="user-avatar">
                    <div class="avatar-circle">${fullName.charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="avatar-name">${fullName}</div>
                        <div style="font-size:10px;color:var(--text-muted);text-transform:capitalize">${role}</div>
                    </div>
                </div>
            </div>
        </header>`;
    },

    // 3. Inject UI
    init: () => {
        const user = JSON.parse(localStorage.getItem('dtcsl_user') || '{}');
        const token = localStorage.getItem('dtcsl_token');
        const role = user.role || 'passenger';

        // Auth guard — redirect to login if no token
        if (!token) {
            window.location.href = '../AuthScreen/index.html';
            return;
        }

        const title = document.title.split('-')[0].trim();

        // Prevent injection if already exists
        if (document.getElementById('sidebar')) return;

        // Add sidebar
        const sidebarHTML = UI.getSidebarHTML(role);
        document.body.insertAdjacentHTML('afterbegin', sidebarHTML);

        // Add overlay for mobile
        const overlay = document.createElement('div');
        overlay.id = 'sidebarOverlay';
        overlay.style.cssText = 'display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99;backdrop-filter:blur(2px)';
        overlay.onclick = () => UI.closeSidebar();
        document.body.appendChild(overlay);

        // Add navbar inside main content
        const main = document.querySelector('.main-content');
        if (main) {
            const navbarHTML = UI.getNavbarHTML(title);
            main.insertAdjacentHTML('afterbegin', navbarHTML);
        }

        // Global Event Listeners
        UI.addGlobalListeners();
    },

    closeSidebar: () => {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (sidebar) { sidebar.classList.remove('open'); sidebar.classList.add('collapsed'); }
        if (overlay) overlay.style.display = 'none';
    },

    addGlobalListeners: () => {
        // Sidebar Toggle
        const btn = document.getElementById('sidebarToggle');
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        if (btn && sidebar) {
            btn.onclick = () => {
                const isMobile = window.innerWidth <= 768;
                if (isMobile) {
                    const isOpen = sidebar.classList.contains('open');
                    if (isOpen) {
                        sidebar.classList.remove('open');
                        if (overlay) overlay.style.display = 'none';
                    } else {
                        sidebar.classList.add('open');
                        if (overlay) overlay.style.display = 'block';
                    }
                } else {
                    sidebar.classList.toggle('collapsed');
                }
            };
        }

        // Theme Toggle
        const themeBtn = document.getElementById('themeToggle');
        if (themeBtn) {
            themeBtn.onclick = () => {
                document.body.classList.toggle('light');
                const isLight = document.body.classList.contains('light');
                localStorage.setItem('dtcsl_theme', isLight ? 'light' : 'dark');
                themeBtn.innerHTML = isLight ? '<i class="fas fa-moon"></i>' : '<i class="fas fa-sun"></i>';
            };
            if (localStorage.getItem('dtcsl_theme') === 'light') {
                document.body.classList.add('light');
                themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
            }
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.onclick = (e) => {
                e.preventDefault();
                localStorage.removeItem('dtcsl_token');
                localStorage.removeItem('dtcsl_user');
                window.location.href = '../AuthScreen/index.html';
            };
        }
    }
};

// Export or Auto-Run
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', UI.init);
}
