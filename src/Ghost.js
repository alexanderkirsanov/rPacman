import {GENERAL, PACMAN, KEY} from './Constants'
import Level from './Level';
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

    getColour() {
        if (this.eatable) {
            if (this.secondsAgo(this.eatable) > 5) {
                return this.game.getTick() % 20 > 10 ? Level.GHOST_OPTION.BLINK1 : Level.GHOST_OPTION.BLINK2;
            } else {
                return Level.GHOST_OPTION.BLINK2;
            }
        } else if (this.eaten) {
            return Level.GENERAL_OPTIONS.EATEN;
        }
        return this.colour;
    }

    draw(context) {

        let size = this.map.getBlockSize(),
            top = (this.position.y / 10) * size,
            left = (this.position.x / 10) * size;

        if (this.eatable && this.secondsAgo(this.eatable) > 8) {
            this.eatable = null;
        }

        if (this.eaten && this.secondsAgo(this.eaten) > 3) {
            this.eaten = null;
        }

        let tl = left + size,
            base = top + size - 3,
            inc = size / 10;

        let high = this.game.getTick() % 10 > 5 ? 3 : -3;
        let low = this.game.getTick() % 10 > 5 ? -3 : 3;

        context.fillStyle = this.getColour();
        context.beginPath();

        context.moveTo(left, base);

        context.quadraticCurveTo(left, top, left + (size / 2), top);
        context.quadraticCurveTo(left + size, top, left + size, base);

        context.quadraticCurveTo(tl - (inc), base + high, tl - (inc * 2), base);
        context.quadraticCurveTo(tl - (inc * 3), base + low, tl - (inc * 4), base);
        context.quadraticCurveTo(tl - (inc * 5), base + high, tl - (inc * 6), base);
        context.quadraticCurveTo(tl - (inc * 7), base + low, tl - (inc * 8), base);
        context.quadraticCurveTo(tl - (inc * 9), base + high, tl - (inc * 10), base);

        context.closePath();
        context.fill();

        context.beginPath();
        context.fillStyle = Level.GHOST_OPTION.BLINK1;
        context.arc(left + 6, top + 6, size / 6, 0, 300, false);
        context.arc((left + size) - 6, top + 6, size / 6, 0, 300, false);
        context.closePath();
        context.fill();

        let f = size / 12,
            off = {};
        off[GENERAL.RIGHT] = [f, 0];
        off[GENERAL.LEFT] = [-f, 0];
        off[GENERAL.UP] = [0, -f];
        off[GENERAL.DOWN] = [0, f];

        context.beginPath();
        context.fillStyle = "#000";
        context.arc(left + 6 + off[this.direction][0], top + 6 + off[this.direction][1],
            size / 15, 0, 300, false);
        context.arc((left + size) - 6 + off[this.direction][0], top + 6 + off[this.direction][1],
            size / 15, 0, 300, false);
        context.closePath();
        context.fill();
    }

    pane(position) {
        if (position.y === 100 && position.x >= 190 && this.direction === GENERAL.RIGHT) {
            return {y: 100, x: -10};
        }
        if (position.y === 100 && position.x <= -10 && this.direction === GENERAL.LEFT) {
            this.position = {y: 100, x: 190};
            return this.position;
        }
        return false;
    }

    ;

    move(context) {

        let oldPos = this.position,
            onGrid = this.onGridSquare(this.position),
            npos = null;

        if (this.due !== this.direction) {

            npos = this.getNewCoord(this.due, this.position);

            if (onGrid &&
                this.map.isFloorSpace({
                    y: this.pointToCoord(this.nextSquare(npos.y, this.due)),
                    x: this.pointToCoord(this.nextSquare(npos.x, this.due))
                })) {
                this.direction = this.due;
            } else {
                npos = null;
            }
        }

        if (npos === null) {
            npos = this.getNewCoord(this.direction, this.position);
        }

        if (onGrid &&
            this.map.isWallSpace({
                y: this.pointToCoord(this.nextSquare(npos.y, this.direction)),
                x: this.pointToCoord(this.nextSquare(npos.x, this.direction))
            })) {

            this.due = this.getRandomDirection();
            return this.move(context);
        }

        this.position = npos;

        let tmp = this.pane(this.position);
        if (tmp) {
            this.position = tmp;
        }

        this.due = this.getRandomDirection();

        return {
            'new': this.position,
            old: oldPos
        };
    }
}
export default Ghost;