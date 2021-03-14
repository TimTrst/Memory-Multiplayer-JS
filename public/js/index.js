const socket = io();

//Abfangen der Server Antworten --> socket.on
socket.on('init', handleInit);
//socket.on('gameState', handleGameState)

socket.on('flipCard', cardInfo => {
    flipCard(cardInfo);
});

socket.on('shuffleDeck', (deck) => {
    shuffle(deck);
});

playerState = [];

socket.on('playerState', (player) => {
    playerState = player;
});

socket.on('removeLife', (roundLoser) => {
    removeLife(roundLoser);
});

socket.on('resetGame', (deck) => {
    resetGame(deck);
});

socket.on('updateScore', () => {
    updateScore();
});
const cards = document.querySelectorAll('.game-card');

// var gameState;
// function handleGameState(state){
//     gameState = JSON.parse(state);
// }

let cardFlipped = false;
let firstCard, secondCard;
let lockGame = false;

function flipCard(cardInfo) {

    if (lockGame) {
        return;
    }

    let toBeFlipped;
    cards.forEach(card => {
        if (card.dataset.card === cardInfo.name && card.style.order === cardInfo.order) {
            toBeFlipped = card;
        }
    });

    toBeFlipped.classList.add('flip');

    if (!cardFlipped) {
        cardFlipped = true;
        firstCard = toBeFlipped;
        return;
    } else {
        cardFlipped = false;
        secondCard = toBeFlipped;
    }

    console.log(playerState);

    if (firstCard.dataset.card === secondCard.dataset.card) {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);

        if (playerState[0].canFlip === true) {
            socket.emit('updateScore', playerState[0].id)
        } else {
            socket.emit('updateScore', playerState[1].id)
        }

        resetTurn();
    } else {
        lockGame = true;
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');

            if (playerState[0].canFlip === true) {
                socket.emit('cannotFlip', playerState[0].id)
            } else {
                socket.emit('cannotFlip', playerState[1].id)
            }

            resetTurn();
        }, 1500);
    }
}

function resetTurn() {
    cardFlipped = false;
    firstCard = null;
    secondCard = null;
    lockGame = false;
}

//anfordern einer Shuffle funktion an Server
socket.emit('shuffle');

//Rückgabe der Informationen vom Server --> gleiches Reihenfolge der Karten für beide Nutzer
function shuffle(deck) {
    cards.forEach((card, index) => {
        card.style.order = deck[index];
    });
};

//Warten auf Klick eines Nutzers
cards.forEach(card => card.addEventListener('click', () => sendFlippedCard(card)));

//Senden der geklickten Karte an den Server
function sendFlippedCard(card) {
    var cardInfo = { name: card.dataset.card, order: card.style.order }
    socket.emit('flip', cardInfo);
}

//entfernen eines Herzen aus der Stats Box
function removeLife(roundLoser) {
    var heart = document.querySelector(`#heartsPlayer${roundLoser}`);
    // if(roundLoser === 0){
    //     var heart = document.querySelector("#heartsPlayer1");
    // }else{
    //     var heart = document.querySelector("#heartsPlayer2");
    // }
   
    if(heart){
        heart.removeChild(heart.firstChild);
    }
}

//Zurücksetzen des Spielfeldes, wenn eine Runde vorbei ist
function resetGame(deck) {
    lockGame = true;
    setTimeout(() => {
        cards.forEach(card => {
            card.classList.remove('flip');
        });
        resetTurn();
        shuffle(deck);
        document.querySelector("#scorePlayer1").innerHTML = 0;
        document.querySelector("#scorePlayer2").innerHTML = 0;
    }, 3000);
}

//Updaten des Score in den Stats
function updateScore(){
    if(playerState[0].canFlip){
        var score = document.querySelector("#scorePlayer1");
        score.innerHTML = playerState[0].score +1;
    }else{
        var score = document.querySelector("#scorePlayer2");
        score.innerHTML = playerState[1].score +1;
    }
}

socket.on('message', message => {
    console.log(message);
});

function handleInit(msg) {
    console.log(msg);
}
