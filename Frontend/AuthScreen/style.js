// ══════════════ PANEL TOGGLE ══════════════
const authWrapper = document.querySelector('.auth-wrapper');
const loginTrigger = document.querySelector('.login-trigger');
const registerTrigger = document.querySelector('.register-trigger');

registerTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    authWrapper.classList.add('toggled');
});

loginTrigger.addEventListener('click', (e) => {
    e.preventDefault();
    authWrapper.classList.remove('toggled');
});

// ══════════════ API CONFIG ══════════════
const API_URL = 'http://127.0.0.1:5000/api';

// ══════════════ LOGIN HANDLER ══════════════
const loginForm = document.querySelector('.credentials-panel.signin form');
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputs = loginForm.querySelectorAll('input');
    const username = inputs[0].value.trim().toLowerCase();
    const password = inputs[1].value;

    if (!username || !password) return;

    const btn = loginForm.querySelector('.submit-button');
    const originalText = btn.textContent;
    btn.textContent = 'Logging in...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || 'Login failed');
            btn.textContent = originalText;
            btn.disabled = false;
            return;
        }

        // Store token and user info
        localStorage.setItem('dtcsl_token', data.token);
        localStorage.setItem('dtcsl_user', JSON.stringify(data.user));

        // Redirect based on role
        const role = data.user.role;
        if (role === 'admin') {
            window.location.href = '../Admin/dashboard.html';
        } else if (role === 'depot') {
            window.location.href = '../DepotManager/index.html';
        } else if (role === 'driver') {
            window.location.href = '../Driver/index.html';
        } else if (role === 'passenger') {
            window.location.href = '../Passenger/index.html';
        } else {
            window.location.href = '../Admin/dashboard.html';
        }

    } catch (err) {
        alert('Cannot connect to server. Make sure the backend is running.');
        btn.textContent = originalText;
        btn.disabled = false;
    }
});

// ══════════════ REGISTER HANDLER ══════════════
const registerForm = document.querySelector('.credentials-panel.signup form');
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputs = registerForm.querySelectorAll('input');
    const username = inputs[0].value.trim();
    const email = inputs[1].value.trim();
    const password = inputs[2].value;

    const role = 'passenger';

    if (!username || !password) return;

    const btn = registerForm.querySelector('.submit-button');
    const originalText = btn.textContent;
    btn.textContent = 'Registering...';
    btn.disabled = true;

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password, role })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(data.message || 'Registration failed');
            btn.textContent = originalText;
            btn.disabled = false;
            return;
        }

        alert('Registration successful! Please login.');
        authWrapper.classList.remove('toggled');
        btn.textContent = originalText;
        btn.disabled = false;

    } catch (err) {
        alert('Cannot connect to server. Make sure the backend is running.');
        btn.textContent = originalText;
        btn.disabled = false;
    }
});