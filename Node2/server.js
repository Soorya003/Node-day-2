// server.js

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Dummy Data (to simulate storage in memory)
let rooms = [];
let bookings = [];

// Endpoints

// 1. Create a Room
app.post('/rooms', (req, res) => {
    const { roomName, numberOfSeats, amenities, pricePerHour } = req.body;
    const room = {
        id: rooms.length + 1,
        roomName,
        numberOfSeats,
        amenities,
        pricePerHour,
    };
    rooms.push(room);
    res.status(201).json(room);
});

// 2. Book a Room
app.post('/bookings', (req, res) => {
    const { customerName, date, startTime, endTime, roomId } = req.body;

    // Check if room is available for booking
    const isRoomAvailable = !bookings.some(booking => {
        return booking.roomId === roomId &&
               booking.date === date &&
               !(endTime <= booking.startTime || startTime >= booking.endTime);
    });

    if (!isRoomAvailable) {
        return res.status(400).json({ error: 'Room already booked for the given time slot.' });
    }

    const booking = {
        bookingId: bookings.length + 1,
        customerName,
        date,
        startTime,
        endTime,
        roomId,
        bookingDate: new Date().toISOString(),
        bookingStatus: 'Booked',
    };
    bookings.push(booking);
    res.status(201).json(booking);
});

// 3. List All Rooms with Bookings
app.get('/rooms', (req, res) => {
    const roomsWithBookings = rooms.map(room => {
        const bookingsForRoom = bookings.filter(booking => booking.roomId === room.id);
        return {
            roomName: room.roomName,
            bookedStatus: bookingsForRoom.length > 0 ? 'Booked' : 'Available',
            bookings: bookingsForRoom,
        };
    });
    res.json(roomsWithBookings);
});

// 4. List All Customers with Bookings
app.get('/customers', (req, res) => {
    const customersWithBookings = [];
    bookings.forEach(booking => {
        const room = rooms.find(room => room.id === booking.roomId);
        customersWithBookings.push({
            customerName: booking.customerName,
            roomName: room.roomName,
            date: booking.date,
            startTime: booking.startTime,
            endTime: booking.endTime,
        });
    });
    res.json(customersWithBookings);
});

// 5. List Booking History for a Customer
app.get('/customers/:customerName/bookings', (req, res) => {
    const { customerName } = req.params;
    const customerBookings = bookings.filter(booking => booking.customerName === customerName);
    res.json(customerBookings);
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
