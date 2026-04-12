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
                { name: 'Routes', icon: 'fas fa-route', link: '../DepotManager/routes.html', id: 'routes' },
                { name: 'Leaves', icon: 'fas fa-calendar-minus', link: '../DepotManager/leaves.html', id: 'depot-leaves' },
                { name: 'Profile', icon: 'fas fa-user-cog', link: '../DepotManager/profile.html', id: 'profile' }
            ],
            driver: [
                { name: 'My Trips', icon: 'fas fa-road', link: '../Driver/index.html', id: 'driver-trips' },
                { name: 'Active Duty', icon: 'fas fa-bus-alt', link: '../Driver/duty.html', id: 'driver-duty' },
                { name: 'Routes', icon: 'fas fa-route', link: '../Driver/routes.html', id: 'routes' },
                { name: 'Apply Leave', icon: 'fas fa-calendar-minus', link: '../Driver/leave.html', id: 'driver-leave' },
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

        let profileLink = '../Passenger/profile.html';
        if(role === 'admin') profileLink = '../Admin/profile.html';
        else if(role === 'depot') profileLink = '../DepotManager/profile.html';
        else if(role === 'driver') profileLink = '../Driver/profile.html';

        return `
        <header class="topbar">
            <div class="topbar-left">
                <button class="sidebar-toggle" id="sidebarToggle"><i class="fas fa-bars"></i></button>
                <h1 class="page-title">${title || 'Dashboard'}</h1>
            </div>
            <div class="topbar-right">
                <div class="search-box">
                    <i class="fas fa-search"></i>
                    <input type="text" id="globalSearch" placeholder="Search (buses, routes...)">
                </div>
                <button class="topbar-btn" id="themeToggle"><i class="fas fa-sun"></i></button>
                <button class="topbar-btn"><i class="fas fa-bell"></i><span class="notif-dot"></span></button>
                <div class="user-avatar" id="profileDropdownToggle" style="cursor: pointer; position: relative;">
                    <div class="avatar-circle">${fullName.charAt(0).toUpperCase()}</div>
                    <div>
                        <div class="avatar-name">${fullName}</div>
                        <div style="font-size:10px;color:var(--text-muted);text-transform:capitalize">${role}</div>
                    </div>
                    <div class="profile-dropdown" id="profileDropdown" style="display: none; position: absolute; top: 120%; right: 0; background: var(--surface); border: 1px solid var(--border); border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.2); width: 140px; z-index: 1000; overflow: hidden; text-align: left;">
                        <a href="${profileLink}" style="display: block; padding: 12px 15px; color: var(--text); text-decoration: none; font-size: 14px;"><i class="fas fa-user-cog" style="margin-right: 8px;"></i> Profile </a>
                        <div style="height: 1px; background: var(--border);"></div>
                        <div id="dropdownLogoutBtn" style="display: block; padding: 12px 15px; color: #ef4444; font-size: 14px; cursor: pointer;"><i class="fas fa-sign-out-alt" style="margin-right: 8px;"></i> Logout </div>
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

        // Global Search Setup
        const searchInput = document.getElementById('globalSearch');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const query = searchInput.value.toLowerCase().trim();
                    const role = (JSON.parse(localStorage.getItem('dtcsl_user') || '{}').role || 'passenger');
                    if (!query) return;
                    
                    let path = '';
                    if (role === 'admin') {
                        if (query.includes('bus') || query.includes('dl-')) path = 'buses.html';
                        else if (query.includes('route') || query.includes('rt-')) path = 'routes.html';
                        else if (query.includes('crew') || query.includes('driver') || query.includes('cr-')) path = 'crew.html';
                        else if (query.includes('depot')) path = 'depots.html';
                        else if (query.includes('schedule') || query.includes('time')) path = 'schedule.html';
                        else if (query.includes('track') || query.includes('live')) path = 'tracking.html';
                        else path = 'dashboard.html';
                        
                        // Pass query string so pages can potentially filter based on it
                        window.location.href = `../Admin/${path}?search=` + encodeURIComponent(query);
                    } else if (role === 'depot') {
                        if (query.includes('bus') || query.includes('dl-')) path = 'buses.html';
                        else if (query.includes('schedule') || query.includes('rt-')) path = 'schedules.html';
                        else path = 'index.html';
                        window.location.href = `../DepotManager/${path}?search=` + encodeURIComponent(query);
                    } else {
                        UI.showAlert('Search navigated to: ' + query);
                    }
                }
            });
        }

        // Profile Dropdown Actions
        const profileToggle = document.getElementById('profileDropdownToggle');
        const profileDropdown = document.getElementById('profileDropdown');
        if (profileToggle && profileDropdown) {
            profileToggle.onclick = (e) => {
                e.stopPropagation();
                const isHidden = profileDropdown.style.display === 'none';
                profileDropdown.style.display = isHidden ? 'block' : 'none';
            };
            document.addEventListener('click', (e) => {
                if (!profileToggle.contains(e.target)) {
                    profileDropdown.style.display = 'none';
                }
            });
            // Profile link hover styling dynamically if not done in CSS
            const links = profileDropdown.querySelectorAll('a, #dropdownLogoutBtn');
            links.forEach(l => {
                l.addEventListener('mouseenter', () => l.style.background = 'var(--surface-light, rgba(255,255,255,0.05))');
                l.addEventListener('mouseleave', () => l.style.background = 'transparent');
            });
        }

        // Logout Handlers (Both fixed and dropdown)
        const logoutActions = [document.getElementById('logoutBtn'), document.getElementById('dropdownLogoutBtn')];
        logoutActions.forEach(btn => {
            if (btn) {
                btn.onclick = (e) => {
                    e.preventDefault();
                    localStorage.removeItem('dtcsl_token');
                    localStorage.removeItem('dtcsl_user');
                    window.location.href = '../AuthScreen/index.html';
                };
            }
        });
    }
};

// Export or Auto-Run
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', UI.init);
}
