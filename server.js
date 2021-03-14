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
const players = [];
shuffled = false;

let turns = 5;
const deck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12];

shuffle(deck);

let j = -1; //Zufälliges würfeln einer 1 oder 2 für einen zufälligen Start

io.on('connection', client => {
    client.emit('message', 'Welcome to Multiplayer Memory!')

    if (players.length < 2) {
        players.push({ id: client.id, canFlip: true, score: 0, lives: 3 });
    }

    randomStart();

    console.log(j);
    console.log(players)
    if (players[j]) {
        players[j].canFlip = false;
    }

    if (!shuffled) {
        client.on('shuffle', () => {
            io.emit('shuffleDeck', deck)
        })
    }

    //wird aufgerufen, wenn ein Nutzer auf eine Karte klickt
    //wenn der jewilige Nutzer am Zug ist --> 
    //aufforderung an client zum drehen einer Karte und übergabe der Spielerdaten
    client.on('flip', (card) => {
        players.forEach(p => {
            if (p.id === client.id) {
                if (p.canFlip) {
                    io.emit('flipCard', card);
                    io.emit('playerState', players);
                }
            }
        });
    })

    //wird aufgerufen von der Client-Seite, wenn ein Spieler keinen Match hatte
    //--> klickrechte werden gewechselt
    client.on('cannotFlip', (playerId) => {
        players.forEach(p => {
            if (p.id === playerId) {
                p.canFlip = false;
            } else {
                p.canFlip = true;
            }
        });
    });

    //Wird aufgerufen, wenn ein Spieler 2 Karten richtig gedreht hat
    //überprüft anhand der Spieler id, um welchen spieler es sich handelt
    //und gibt diesen einen Punkt
    client.on('updateScore', (playerId) => {
        players.forEach(p => {
            if (p.id === playerId && client.id === playerId) {
                p.score = p.score + 1;

                io.emit('updateScore');

                turns = turns + 1;
                console.log("turns: ", turns)

                let roundLoser = -1;
                if (turns >= 6) {
                    //Prüfen welcher Spieler gewonnen hat
                    roundLoser = checkForRoundWinner(turns);
                    
                    //Leben des verlieres und ein Leben abziehen
                    players[roundLoser].lives = players[roundLoser].lives -1;
                    players[0].score = 0;
                    players[1].score = 0;

                    //Prüfen, ob ein Spieler kein Leben mehr hat
                    if(players[roundLoser].lives === 0){
                        const winner = roundLoser === 1 ? 0 : 1;
                        console.log("gameover winner is: ", winner);
                        io.emit('gameOver', winner);
                    }

                    newDeck = shuffle(deck);
                    io.emit('removeLife', roundLoser);
                    io.emit('resetGame', newDeck); //neu geshuffeltes deck für die neue Runde
                    players[roundLoser].canFlip = true;
                    players[roundLoser === 0 ? 1 : 0].canFlip = false;
                    turns = 5;
                }
                console.log(players)
                if (p.lives === 0) {
                    console.log('Spiel verloren');
                }
            }
        });
    });

    //const state = createGameState();

    //startGameInterval(client, state);

    client.on('dicsonnect', () => {
        io.emit('message', 'A Player has left the Game')
    })
})

// function startGameInterval(client, state){
//     const winner = gameLoop(state);

//     if(!winner){
//         //console.log("startgameint was fired",  state)
//         client.emit('gameState', JSON.stringify(state));
//     }else{
//         client.emit('gameOver');
//     }
// }

//Rückgabe von gemischten Zahlen, damit für beide Spieler die gleiche 
//Sortierung der Karten besteht
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function checkForRoundWinner() {

    if (players[0].score > players[1].score) {
        console.log("Player 1 wins as round!");
        return 1;
    } else {
        console.log("Player 2 wins a round!");
        return 0;
    }

}

function randomStart(){
    if (j === -1) {
        j = Math.floor(Math.random() * 2);
    }
}


const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
