const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const playername1 = document.getElementById('playername1');
const playername2 = document.getElementById('playername2');
const cards = document.querySelectorAll('.game-card');
let playerState;


const { username, room} = Qs.parse(location.search, {
    ignoreQueryPrefix: true
});

const socket = io();

socket.emit('joinRoom', {username, room});

console.log('tesee')
socket.on('roomUsers',({ room , users}) => {
    console.log('roomUsers')
    outputRoomname(room, users);
    outputUsers(users);
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;
    socket.emit('chatMessage' , msg);

    // Eingabe Clearen
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});


socket.on('message', msg => {
    outputMessage(msg);

    // Nachrichten Scrollen
    chatMessages.scrollTop = chatMessages.scrollHeight;
});




//Abfangen der Server Antworten --> socket.on

socket.on('flipCard', cardInfo => {
    flipCard(cardInfo);
});

socket.on('shuffleDeck', (deck) => {
    shuffle(deck);
});


socket.on('playerState', (user) => {
    playerState = user;
});

socket.on('removeLife', (roundLoser) => {
    removeLife(roundLoser);
});
socket.on('resetGame', (deck) => {
    resetGame(deck);
});



// var gameState;
// function handleGameState(state){
//     gameState = JSON.parse(state);
// }

let cardFlipped = false;
let firstCard, secondCard;
let lockGame = false;

function flipCard(cardInfo) {
    let cnt = 0;
    console.log(cnt);
    cnt++;
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

    if (firstCard.dataset.card === secondCard.dataset.card) {
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);

        socket.emit('updateScore', playerState)
        console.log('cnt:' + playerState.playerCount);
        var score = document.getElementById(`.scorePlayer1`);
        score.innerHTML = playerState.score +1;


        resetTurn();
    } else {
        lockGame = true;
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
            console.log(cnt);
            cnt++;
            socket.emit('switchTurn' , playerState)

            resetTurn();
        }, 1500);
    }
    console.log(cnt)
    cnt++;
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
    var heart = document.querySelector(`.heartsPlayer${roundLoser}`);
    if(heart){
        heart.removeChild(heart.firstChild);
    };
}

//Zurücksetzen des Spielfeldes, wenn eine Runde vorbei ist
function resetGame(deck) {
    var heart1 = document.get(`.heartsPlayer1`);
    var heart2 = document.querySelector(`.heartsPlayer1`);

    while (heart1.firstChild){
        heart1.removeChild(heart1.firstChild);
    }

    while (heart2.firstChild){
        heart2.removeChild(heart2.firstChild);
    }

    for(i = 0;i < 4 ;i++){
        heart1.innerHTML(`<li><i class="fa fa-heart"></i></li>`);
        heart2.innerHTML(`<li><i class="fa fa-heart"></i></li>`);
    }
    lockGame = true;
    setTimeout(() => {
        cards.forEach(card => {
            card.classList.remove('flip');
        });
        resetTurn();
        shuffle(deck);
        document.getElementById('.scorePlayer1').innerHTML = 0;
        document.getElementById('.scorePlayer2').innerHTML = 0;
    }, 3000);
}




//Output message to Dom
function outputMessage(message){
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class=meta>${message.username}<span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);
}

function outputRoomname(room){
    roomName.innerText = room;
}

function outputUsers(users){
    console.log('testoutput')
    console.log(user[0])
    //playername1.innerText = users[0].username;
    //playername2.innerText = users[1].username;
}

