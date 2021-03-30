const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);



const formatMessage = require('./utils/messages');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
  } = require('./utils/users');



//Setzen eines Statischen Ordners
app.use(express.static(path.join(__dirname, 'public')));

const { SSL_OP_NO_SESSION_RESUMPTION_ON_RENEGOTIATION } = require('constants');

//const state = {};
shuffled = false;

let turns = 0;
const deck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];

//shuffle(deck);

let j = -1; //Zufälliges würfeln einer 1 oder 2 für einen zufälligen Start

const botName = 'GameMaster';
io.on('connection', socket => {
    //Spieler joint Raum
    socket.on('joinRoom', ({username, room}) => {
        const playerCount = Object.keys(getRoomUsers(room)).length;
        if( playerCount < 2){
            const user = userJoin(socket.id, username, room, playerCount);
            socket.join(user.room);

            //Willkommen an Spieler
            socket.emit('message', formatMessage(botName, 'Welcome to Multiplayer Memory!'));

            //Nachricht neuer Spieler gejoint
        
            socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the Game`));


            if(playerCount === 1){
                randomStart(room);
                io.to(user.room).emit('roomUsers', {
                    room: user.room,
                    users: getRoomUsers(user.room)
                });
                shuffle(deck);
                io.to(user.room).emit('shuffleDeck', deck)
            }

        }else{
            window.alert("Raum voll!");
            console.log('server voll')
        }
    });

    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });     


    /*console.log(j);
    console.log(players)
    if (players[j]) {
        players[j].canFlip = false;
    }'*/

    /*if (!shuffled) {
        socket.on('shuffle', msg => {
            const user = getCurrentUser(socket.id);

            io.to(user.room).emit('shuffleDeck', deck)
        })
    }*/

    //wird aufgerufen, wenn ein Nutzer auf eine Karte klickt
    //wenn der jewilige Nutzer am Zug ist --> 
    //aufforderung an client zum drehen einer Karte und übergabe der Spielerdaten
    socket.on('flip', (card) => {
        const user = getCurrentUser(socket.id);

        if(user.canFlip){
            io.to(user.room).emit('flipCard', card);
            io.to(user.room).emit('playerState', user);
        }
    });

    //wird aufgerufen von der Client-Seite, wenn ein Spieler keinen Match hatte
    //--> klickrechte werden gewechselt
    /*socket.on('cannotFlip', (playerId) => {
        players.forEach(p => {
            if (p.id === playerId) {
                p.canFlip = false;
            } else {
                p.canFlip = true;
            }
        });
    });*/

    //Wird aufgerufen, wenn ein Spieler 2 Karten richtig gedreht hat
    //überprüft anhand der Spieler id, um welchen spieler es sich handelt
    //und gibt diesen einen Punkt
    socket.on('updateScore', (player) => {
        const user = getCurrentUser(socket.id);
        if (user.id === player.id){
            user.score = user.score + 1;
            turns = turns + 1;
            if (turns >= 6) {
                resetRound(user)
            }
        }
    });

    socket.on('switchTurn', player => {
        const user = getCurrentUser(socket.id);
        users = getRoomUsers(player.room);
        if(player.id === user.id){

            users.forEach(element => {
                element.canFlip = !element.canFlip;
            });
        }
    });

    socket.on('revanche', () => {
        const user = getCurrentUser(socket.id);
        if(!user.revanche){
            socket.to(user.room).emit('showRevancheThumb')
        }
        user.revanche = true;
        users = getRoomUsers(user.room);
        
        if (users[0].revanche && users[1].revanche){
            resetGame(user);
        }    
    });

    //const state = createGameState();

    //startGameInterval(client, state);

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user){
            io.to(user.room).emit('message', formatMessage(botName,`${user.username} has left the Game`));
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }

    });
});

//Rückgabe von gemischten Zahlen, damit für beide Spieler die gleiche 
//Sortierung der Karten besteht
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function checkForRoundLoser(player) {
    const players = getRoomUsers(player.room);
    if(players[0].score === players[1].score){
        return -1;
    }else if (players[0].score > players[1].score) {
        return players[1];
    }else{
        return players[0];
    }
}

function randomStart(room){
    var players = getRoomUsers(room);
    var player = players [Math.floor(Math.random() * players.length)];
    player.canFlip = true;
}

function resetRound(user){
        //Prüfen welcher Spieler gewonnen hat
        var roundLoser = checkForRoundLoser(user);
        var players = getRoomUsers(user.room);

        if(roundLoser === -1){
            newDeck = shuffle(deck);
            io.to(user.room).emit('resetRound', newDeck); //neu geshuffeltes deck für die neue Runde
            io.to(user.room).emit('message', formatMessage(botName, "Draw! New Round!"));
            players.forEach(element => element.score = 0);


        }
        else{
            var roundWinner;
            
            //Leben des verlieres und ein Leben abziehen
            roundLoser.lives =  roundLoser.lives -1;
            
            
            players.forEach(element => element.score = 0);

            players.forEach(element => element.canFlip = !element.canFlip);

            players.forEach(element => {if(element.id !== roundLoser.id){roundWinner = element}})

            //Prüfen, ob ein Spieler kein Leben mehr hat
            if(roundLoser.lives === 0){
                const loser = roundLoser;
                console.log("gameover loser is: ", loser);
                io.emit('gameOver', loser);
                io.to(user.room).emit('message', formatMessage(botName, "Gamewinner: " + roundWinner.username));

                resetGame(roundLoser);
            }else{
                newDeck = (deck);
                io.to(user.room).emit('removeLife', roundLoser);
                io.to(user.room).emit('resetRound', newDeck); //neu geshuffeltes deck für die neue Runde
                io.to(user.room).emit('message', formatMessage(botName, "New Round!"));

                turns = 0;
            }
        }
}

function resetGame(user){
    io.to(user.room).emit('message', formatMessage(botName, "New Game!"));

    var players = getRoomUsers(user.room);
    players.forEach(element => element.score = 0);
    players.forEach(element => element.lives = 3);
    players.forEach(element => element.canFlip = !element.canFlip);

    turns = 0;
    randomStart(players[0].room);
    console.log(players)
    console.log(players[0])

    newDeck = shuffle(deck);
    io.to(user.room).emit('resetGame', newDeck); //neu geshuffeltes deck für die neue Runde
    console.log('Game neu gestartet')

}


const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));


