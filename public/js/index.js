
//Get username and lobby from url
// const {username, lobby} = Qs.parse(location.search, {
//     ignoreQueryPrefix: true
// });

const socket = io();

// var joinForm=document.getElementById("join-form");

// function evaluateJoinForm(e){
//     if (e.preventDefault) e.preventDefault();
//     socket.emit('joinLobby', {username, lobby});
// }

// window.onload = function(){
//     var createForm = document.getElementById("create-form");
//     createForm.addEventListener("submit", (e) => {
//         e.preventDefault();
//         console.log("form sub");
//         let username = e.username;
//         let lobby = e.createLobby;
//         console.log("create", username, lobby)
//         socket.emit('createLobby',{username, lobby} );
//     });
// }

const cards = document.querySelectorAll('.game-card');

let cardFlipped = false;
let firstCard, secondCard;
let lockGame = false;
//Warten, bis eine Karte geklickt wird 
//--> wenn geklickt, wird der Klassenname der karte verändert, um eine Animation zu erzeugen
function flipCard(){
    if(lockGame){
        return;
    }

    this.classList.add('flip');

    if(!cardFlipped){
        //Erster klick
        cardFlipped = true;
        firstCard = this;
        return;
    }else{
        cardFlipped = false;
        secondCard = this;
    }

    console.log(this)
    
    if(firstCard.dataset.card === secondCard.dataset.card){
        firstCard.removeEventListener('click', flipCard);
        secondCard.removeEventListener('click', flipCard);
        console.log("went in")
        resetTurn();
    }else{
        lockGame = true;
        setTimeout(() => {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');

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

(function shuffle(){
    cards.forEach(card => {
        let rand = Math.floor(Math.random() * 12);
        card.style.order = rand;
    });
})();

let playerOne = true;

if(playerOne){

    cards.forEach(card => card.addEventListener('click', flipCard));
}

socket.on('message', message => {
    console.log(message);
});