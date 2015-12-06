const KEY = {};
class Game {
    constructor(element){
        this.element = element;
        document.addEventListener('keydown', (e) => this.keyDown(e));
        document.addEventListener('keypress', (e) => this.keyPress(e));

    }
    startNewGame() {
    }

    keyDown(event){
        if (e.keyCode === KEY.N) {
            this.startNewGame();
        }
        return true;
    }
    keyPress(event){

    }
}


new Game(document.getElementById('pacman'));