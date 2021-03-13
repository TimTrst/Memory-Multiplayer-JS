const socket = io();

//Abfangen der Server Antworten --> socket.on
socket.on('init', handleInit);
socket.on('gameState', handleGameState)

socket.on('flipCard', cardInfo =>{
    flipCard(cardInfo);
});

socket.on('shuffleDeck', (deck) => {
    shuffle(deck);
});

playerState = [];

socket.on('playerState', (player) => {
    playerState = player;
});
const cards = document.querySelectorAll('.game-card');

var gameState;
function handleGameState(state){
    gameState = JSON.parse(state);
}

let cardFlipped = false;
let firstCard, secondCard;
let lockGame = false;

function flipCard(cardInfo){

    if(lockGame){
        return;
    }

    let toBeFlipped;
    cards.forEach(card => {
        if(card.dataset.card === cardInfo.name && card.style.order === cardInfo.order){
            toBeFlipped = card;
        }
    });
    
    toBeFlipped.classList.add('flip');

    if(!cardFlipped){
        cardFlipped = true;
        firstCard = toBeFlipped;
        return;
    }else{
        cardFlipped = false;
        secondCard = toBeFlipped;
    }
    console.log(" ssss",playerState[0].score)
    console.log(" ssss",playerState[1].score)
    
    if(firstCard.dataset.card === secondCard.dataset.card){
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);

        if(playerState[0].canFlip === true){
            socket.emit('updateScore', playerState[0].id)
        }else{
            socket.emit('updateScore', playerState[1].id)
        }

        resetTurn();
    }else{
        lockGame = true;
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');

            if(playerState[0].canFlip === true){
                socket.emit('cannotFlip', playerState[0].id)
            }else{
                socket.emit('cannotFlip', playerState[1].id)
            }

            resetTurn();
        }, 1500);
    }
}

function resetTurn(){
    cardFlipped = false;
    firstCard = null;
    secondCard = null;
    lockGame = false;
}

//anfordern einer Shuffle funktion an Server
socket.emit('shuffle');

//Rückgabe der Informationen vom Server --> gleiches Reihenfolge der Karten für beide Nutzer
function shuffle(deck){
    cards.forEach((card,index) => {
        card.style.order = deck[index];
    });
};

//Warten auf Klick eines Nutzers
cards.forEach(card => card.addEventListener('click', () => sendFlippedCard(card)));

//Senden der geklickten Karte an den Server
function sendFlippedCard(card){
    var cardInfo = {name: card.dataset.card, order: card.style.order}
    socket.emit('flip', cardInfo );
}

socket.on('message', message => {
    console.log(message);
});

function handleInit(msg){
    console.log(msg);
}
