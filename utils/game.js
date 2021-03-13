module.exports = {
    createGameState,
    gameLoop
}

function initGame() {
    const state = createGameState();
    return state;
}

function createGameState() {
    return {
        players: [{
            score: 0,
            lifes: 3,
            canFlipCard: true,
        },
        {
            score: 0,
            lifes: 3,
            canFlipCard: false,
        }]
    };
}

function gameLoop(state){
    if(!state){
        return;
    }
 
    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    if(playerOne.lifes === 0){
        return 1;
    }
    if(playerTwo.lifes === 0){
        return 2;
    }

    return false;
}
