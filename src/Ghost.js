import {GENERAL, PACMAN, KEY} from './Constants'
class Ghost {
    constructor(game, map, colour) {
        this.position = null;
        this.direction = null;
        this.eatable = null;
        this.eaten = null;
        this.due = null;
        this.game = game;
        this.map = map;
        this.colour = colour;
    }

    getNewCoord(direction, current) {
        let speed = this.isVunerable() ? 1 : this.isHidden() ? 4 : 2,
            xSpeed = (direction === GENERAL.LEFT && -speed || direction === GENERAL.RIGHT && speed || 0),
            ySpeed = (direction === GENERAL.DOWN && speed || direction === GENERAL.UP && -speed || 0);
        return {
            x: this.addBounded(current.x, xSpeed),
            y: this.addBounded(current.y, ySpeed)
        };
    }

    addBounded(x1, x2) {
        let rem = x1 % 10,
            result = rem + x2;
        if (rem !== 0 && result > 10) {
            return x1 + (10 - rem);
        } else if (rem > 0 && result < 0) {
            return x1 - rem;
        }
        return x1 + x2;
    }

    isVunerable() {
        return this.eatable !== null;
    }

    isDangerous() {
        return this.eaten === null;
    }

    isHidden() {
        return this.eatable === null && this.eaten !== null;
    }

    getRandomDirection() {
        let moves = (this.direction === GENERAL.LEFT || this.direction === GENERAL.RIGHT)
            ? [GENERAL.UP, GENERAL.DOWN] : [GENERAL.LEFT, GENERAL.RIGHT];
        return moves[Math.floor(Math.random() * 2)];
    }

    reset() {
        this.eaten = null;
        this.eatable = null;
        this.position = {x: 90, y: 80};
        this.direction = this.getRandomDirection();
        this.due = this.getRandomDirection();
    }

    onWholeSquare(x) {
        return x % 10 === 0;
    }

    oppositeDirection(direction) {
        return direction === GENERAL.LEFT && GENERAL.RIGHT ||
            direction === GENERAL.RIGHT && GENERAL.LEFT ||
            direction === GENERAL.UP && GENERAL.DOWN || GENERAL.UP;
    }

    makeEatable() {
        this.direction = this.oppositeDirection(this.direction);
        this.eatable = this.game.getTick();
    }

    eat() {
        this.eatable = null;
        this.eaten = this.game.getTick();
    }
    pointToCoord(x) {
        return Math.round(x / 10);
    }

    nextSquare(x, direction) {
        let rem = x % 10;
        if (rem === 0) {
            return x;
        } else if (direction === GENERAL.RIGHT || direction === GENERAL.DOWN) {
            return x + (10 - rem);
        } else {
            return x - rem;
        }
    }

    onGridSquare(position) {
        return this.onWholeSquare(position.y) && this.onWholeSquare(position.x);
    }

    secondsAgo(tick) {
        return (this.game.getTick() - tick) / GENERAL.FPS;
    }


}