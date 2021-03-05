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

const connections =[null,null];

io.on('connection', socket => {

    //Überprüfen auf spieleranzahl
    let playerIndex = -1;
    for(const i in connections){
        if(connections[i] === null){
            playerIndex = i;
            break
        }
    }

    //auf dritten Spieler prüfen
    if(playerIndex === -1) return;

    socket.emit('player-number', playerIndex)
    console.log(`Player ${playerIndex} has connected`);

 
    /*
    socket.on('joinLobby', (lobbyName, callback) => {
        const player = playerJoin( socket.id,username, lobbyName);
        socket.join(player.lobby);
        //const lobby = lobbys[lobbyId];
        //callback();
    });

    //Auslagern in lobby datei
    socket.on('createLobby', (lobbyName, callBack) => {
        const lobby = {
            id: uuid(),
            name: lobbyName,
            sockets: []
        };
        lobby[lobby.id] = lobby;
        joinLobby(soket,room);
        callBack();
    });

    socket.on('getLobbyNames', (data, callback) => {
        const lobbyNames = [];
        for(const id in lobbys){
            const {name} = lobbys[id];
            const lobby = {name, id};
            lobbyNames.push(lobby);
        }
        */
    
    socket.emit('message', 'Welcome to Multiplayer Memory!')

    //socket.broadcast.emit('message', 'A Player joined the lobby');

    socket.on('dicsonnect', () => {
        io.emit('message', 'A Player has left the Game')
    })
})

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
