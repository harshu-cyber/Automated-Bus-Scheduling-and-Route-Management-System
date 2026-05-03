module.exports = (io) => {
    console.log('Socket.io tracking logic initialized.');

    // ═══════════════════════════════════════════════════
    //  TRACKING LOGIC
    // ═══════════════════════════════════════════════════
    io.on('connection', (socket) => {
        console.log(`New connection: ${socket.id}`);

        // 1. Driver sends live location (lat, lng, busRegNo)
        socket.on('sendLocation', (data) => {
            const { busRegNo, lat, lng, driverName } = data;
            
            if (!busRegNo || !lat || !lng) {
                console.warn(`[Socket] Received invalid location data from ${socket.id}`);
                return;
            }

            console.log(`[Socket] Bus ${busRegNo} at Lat:${lat}, Lng:${lng}`);

            // 2. Broadcast to all (Passengers/Admin)
            io.emit('receiveLocation', {
                busRegNo,
                lat,
                lng,
                driverName,
                routeId: data.routeId,
                timestamp: new Date()
            });
        });

        socket.on('disconnect', () => {
            console.log(`Connection closed: ${socket.id}`);
        });
    });
};
