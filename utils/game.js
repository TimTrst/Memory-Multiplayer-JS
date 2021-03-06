module.exports = {

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
            canFlipCard: false,
        },
        {
            score: 0,
            lifes: 3,
            canFlipCard: false,
        }]
    };
}

const playerOne = state.players[0];
const playerTwo = state.players[1];
