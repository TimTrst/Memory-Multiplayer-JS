const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

//Setzen eines Statischen Ordners
app.use(express.static(path.join(__dirname, 'public')));

const { createGameState, gameLoop } = require('./utils/game');

//const state = {};
const lobbys = {};
const player = [];
shuffled = false;

let turns = 0;
const deck = [1,2,3,4,5,6,7,8,9,10,12];

shuffle(deck); 

io.on('connection', client => {
    client.emit('message', 'Welcome to Multiplayer Memory!')

    if(player.length < 2){
        player.push({id: client.id, canFlip: true, score: 0 });
    }
    if(player[1]){
        player[1].canFlip = false;
    }

    console.log(player)
    if(!shuffled){
        client.on('shuffle' , () => {
            io.emit('shuffleDeck', deck)
        })
    }
    
    //wird aufgerufen, wenn ein Nutzer auf eine Karte klickt
    //wenn der jewilige Nutzer am Zug ist --> 
    //aufforderung an client zum drehen einer Karte und übergabe der Spielerdaten
    client.on('flip', (card) => {
        player.forEach(p => {
            if(p.id === client.id){
                if(p.canFlip){
                    io.emit('flipCard', card);
                    io.emit('playerState', player);
                }
            }
        });
    })

    //wird aufgerufen von der Client-Seite, wenn ein Spieler keinen Match hatte
    //--> klickrechte werden gewechselt
    client.on('cannotFlip', (playerId) => {
        player.forEach(p => {
            if(p.id === playerId){
                p.canFlip = false;
            }else{
                p.canFlip = true;
            }
        });
    });

    //Wird aufgerufen, wenn ein Spieler 2 Karten richtig gedreht hat
    //überprüft anhand der Spieler id, um welchen spieler es sich handelt
    //und gibt diesen einen Punkt
    client.on('updateScore', (playerId) => {
        player.forEach(p => {
            if(p.id === playerId && client.id === playerId){
                p.score = p.score + 1;
                turns = turns + 1;
                console.log("turns: ", turns)
                if(turns === 6){
                    if(player[0].score > player[1].score){
                        console.log("Player 1 wins!");
                    }else{
                        console.log("Player 2 wins!");
                    }
                }
            }
        });
    });

    
    const state = createGameState();
    
    startGameInterval(client, state);
    
    client.on('dicsonnect', () => {
        io.emit('message', 'A Player has left the Game')
    })
})

function startGameInterval(client, state){
    const winner = gameLoop(state);
    
    if(!winner){
        //console.log("startgameint was fired",  state)
        client.emit('gameState', JSON.stringify(state));
    }else{
        client.emit('gameOver');
    }
}

//Rückgabe von gemischten Zahlen, damit für beide Spieler die gleiche 
//Sortierung der Karten besteht
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}
const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
