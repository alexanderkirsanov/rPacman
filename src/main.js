const KEY = {};
import Game from './Game';
class GameRunner {
    constructor(element) {
        this.element = element;

        let blockSize = this.element.offsetWidth / 19,
            canvas = document.createElement('canvas');

        canvas.setAttribute('width', (blockSize * 19) + 'px');
        canvas.setAttribute('height', (blockSize * 22) + 65 + 'px');
        this.element.appendChild(canvas);
        let ctx = canvas.getContext('2d');
        const game = new Game(ctx, blockSize);
        document.addEventListener('keydown', (e) => game.onKeyDown(e));
        document.addEventListener('keypress', (e) => game.onKeyPress(e));
    }
}


new GameRunner(document.getElementById('pacman'));