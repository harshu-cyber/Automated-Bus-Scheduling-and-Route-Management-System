// ═══════════════════════════════════════════════════
//  DTCSL SHARED SOCKET CLIENT (Real-time Tracking)
// ═══════════════════════════════════════════════════

const SOCKET_SERVER = 'http://localhost:5000';

const SocketClient = {
    socket: null,
    listeners: [],

    init: (role) => {
        // Load socket.io from CDN dynamically if not available
        if (typeof io === 'undefined') {
            const script = document.createElement('script');
            script.src = "https://cdn.socket.io/4.7.2/socket.io.min.js";
            script.onload = () => SocketClient.connect(role);
            document.head.appendChild(script);
        } else {
            SocketClient.connect(role);
        }
    },

    connect: (role) => {
        const token = localStorage.getItem('dtcsl_token');
        SocketClient.socket = io(SOCKET_SERVER, {
            auth: { token }
        });

        SocketClient.socket.on('connect', () => {
            console.log(`[Socket] Connected as ${role} (ID: ${SocketClient.socket.id})`);
        });

        // Broadcast listener (received by Passengers/Admin)
        SocketClient.socket.on('receiveLocation', (data) => {
            SocketClient.listeners.forEach(cb => cb(data));
        });

        SocketClient.socket.on('disconnect', () => {
             console.warn('[Socket] Disconnected from server.');
        });
    },

    // 1. Driver sends live location
    sendLocation: (busRegNo, lat, lng, driverName) => {
        if (!SocketClient.socket) return;
        SocketClient.socket.emit('sendLocation', { busRegNo, lat, lng, driverName });
    },

    // 2. Add listener for incoming locations
    onLocationUpdate: (callback) => {
        SocketClient.listeners.push(callback);
    }
};

// Auto-run if token exists
const user = JSON.parse(localStorage.getItem('dtcsl_user') || '{}');
if (user.role) {
    SocketClient.init(user.role);
}
