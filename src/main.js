import Map from './Map';
const KEY = {};
class Game {
    constructor(element) {
        this.element = element;
        document.addEventListener('keydown', (e) => this.keyDown(e));
        document.addEventListener('keypress', (e) => this.keyPress(e));
        let blockSize = this.element.offsetWidth / 19,
            canvas = document.createElement("canvas");

        canvas.setAttribute("width", (blockSize * 19) + "px");
        canvas.setAttribute("height", (blockSize * 22) + 30 + "px");

        this.element.appendChild(canvas);

        let ctx = canvas.getContext('2d');
        this.map = new Map(ctx,blockSize);
        this.map.draw();
    }

    startNewGame() {
    }

    keyDown(event) {
        if (event.keyCode === KEY.N) {
            this.startNewGame();
        }
        return true;
    }

    keyPress(event) {

    }
}


new Game(document.getElementById('pacman'));