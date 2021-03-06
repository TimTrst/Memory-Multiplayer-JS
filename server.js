const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

//const {playerJoin, getCurrentPlayer} = require('./utils/players');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Setzen eines Statischen Ordners
app.use(express.static(path.join(__dirname, 'public')));

//const lobbys = [];

const state = {};
const lobbys = {};

io.on('connection', socket => {

    socket.emit('message', 'Welcome to Multiplayer Memory!')

    

    socket.on('dicsonnect', () => {
        io.emit('message', 'A Player has left the Game')
    })
})

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
