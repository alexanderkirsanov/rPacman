import {GENERAL, PACMAN, KEY} from './Constants'
class User {
    constructor(game, map) {
        this.keyMap = {};
        this.keyMap[KEY.ARROW_LEFT] = GENERAL.LEFT;
        this.keyMap[KEY.ARROW_UP] = GENERAL.UP;
        this.keyMap[KEY.ARROW_RIGHT] = GENERAL.RIGHT;
        this.keyMap[KEY.ARROW_DOWN] = GENERAL.DOWN;
        this.game = game;
        this.map = map;
        this.score = 5;
        this.lives = null;
        this.initUser();
    }

    addScore(score) {
        this.score += score;
        if (this.score >= 10000 && this.score - score < 10000) {
            this.lives += 1;
        }
    }

    getScore() {
        return this.score;
    }

    loseLife() {
        this.lives -= 1;
    }

    initUser() {
        this.score = 5;
        this.lives = 3;
        this.newLevel();
    }

    newLevel() {
        this.resetPosition();
        this.eaten = 0;
    }

    resetPosition() {
        this.position = {x: 90, y: 120};
        this.direction = GENERAL.LEFT;
        this.due = GENERAL.LEFT;
    }

    reset() {
        initUser();
    }

    keyDown(e) {
        if (this.keyMap[e.keyCode]) {
            this.due = this.keyMap[e.keyCode];
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
        return true;
    }

    getNewCoordinates(direction, current) {
        return {
            x: current.x + (direction === GENERAL.LEFT && -2 || direction === GENERAL.RIGHT && 2 || 0),
            y: current.y + (direction === GENERAL.DOWN && 2 || direction === GENERAL.UP && -2 || 0)
        }
    }

    onWholeSquare(x) {
        return x % 10 === 0;
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

    next(position, direction) {
        return {
            y: this.pointToCoord(this.nextSquare(position.y, direction)),
            x: this.pointToCoord(this.nextSquare(position.x, direction))
        }
    }

    onGridSquare(position) {
        return this.onWholeSquare(position.y) && this.onWholeSquare(position.x);
    }

    isOnSamePlane(due, direction) {
        return ((due === GENERAL.LEFT || due === GENERAL.RIGHT) &&
            (direction === GENERAL.LEFT || direction === GENERAL.RIGHT)) ||
            ((due === GENERAL.UP || due === GENERAL.DOWN) &&
            (direction === GENERAL.UP || direction === GENERAL.DOWN));
    }

    move(context) {

        let npos = null,
            nextWhole,
            oldPosition = this.position,
            block;

        if (this.due !== this.direction) {
            npos = this.getNewCoord(this.due, this.position);

            if (this.isOnSamePlane(this.due, this.direction) ||
                (this.onGridSquare(this.position) &&
                this.map.isFloorSpace(this.next(npos, this.due)))) {
                this.direction = this.due;
            } else {
                npos = null;
            }
        }

        if (npos === null) {
            npos = this.getNewCoord(this.direction, this.position);
        }

        if (this.onGridSquare(this.position) && this.map.isWallSpace(this.next(npos, this.direction))) {
            this.direction = GENERAL.NONE;
        }

        if (this.direction === this.NONE) {
            return {'new': this.position, old: GENERAL.position};
        }

        if (npos.y === 100 && npos.x >= 190 && this.direction === GENERAL.RIGHT) {
            npos = {y: 100, x: -10};
        }

        if (npos.y === 100 && npos.x <= -12 && this.direction === GENERAL.LEFT) {
            npos = {'y': 100, 'x': 190};
        }

        this.position = npos;
        nextWhole = this.next(this.position, this.direction);

        block = this.map.block(nextWhole);

        if ((this.isMidSquare(this.position.y) || this.isMidSquare(this.position.x)) &&
            block === PACMAN.CAKE || block === PACMAN.BONUS || block === PACMAN.PILL) {

            this.map.setBlock(nextWhole, PACMAN.EMPTY);
            this.addScore((block === PACMAN.BISCUIT) ? 10 : 50);
            this.eaten += 1;

            if (this.eaten === 182) {
                this.game.completedLevel();
            }

            if (block === PACMAN.PILL) {
                this.game.eatenPill();
            }
        }

        return {
            'new': this.position,
            old: oldPosition
        };
    }

    isMidSquare(x) {
        let rem = x % 10;
        return rem > 3 || rem < 7;
    }

    calcAngle(dir, pos) {
        if (dir == GENERAL.RIGHT && (pos.x % 10 < 5)) {
            return {start: 0.25, end: 1.75, direction: false};
        } else if (dir === GENERAL.DOWN && (pos.y % 10 < 5)) {
            return {start: 0.75, end: 2.25, direction: false};
        } else if (dir === GENERAL.UP && (pos.y % 10 < 5)) {
            return {start: 1.25, end: 1.75, direction: true};
        } else if (dir === GENERAL.LEFT && (pos.x % 10 < 5)) {
            return {start: 0.75, end: 1.25, direction: true};
        }
        return {start: 0, end: 2, direction: false};
    }

    drawDead(ctx, amount) {
        let size = this.map.blockSize,
            half = size / 2;

        if (amount >= 1) {
            return;
        }

        ctx.fillStyle = '#FFFF00';
        ctx.beginPath();
        ctx.moveTo(((this.position.x / 10) * size) + half,
            ((this.position.y / 10) * size) + half);

        ctx.arc(((this.position.x / 10) * size) + half,
            ((this.position.y / 10) * size) + half,
            half, 0, Math.PI * 2 * amount, true);

        ctx.fill();
    }

    draw(ctx) {
        let s = this.map.blockSize,
            angle = this.calcAngle(this.direction, this.position);

        ctx.fillStyle = GENERAL.color.PACMAN;

        ctx.beginPath();

        ctx.moveTo(((this.position.x / 10) * s) + s / 2,
            ((this.position.y / 10) * s) + s / 2);

        ctx.arc(((this.position.x / 10) * s) + s / 2,
            ((this.position.y / 10) * s) + s / 2,
            s / 2, Math.PI * angle.start,
            Math.PI * angle.end, angle.direction);

        ctx.fill();
    }
}