import Level from './Level';
import {GENERAL} from './Constants';
import Map from './Map';
import User from './User';
import Ghost from './Ghost';

class Game {
    constructor(context, blockSize) {
        this.tick = 0;
        this.context = context;
        this.map = new Map(context, blockSize);
        this.map.draw();
        this.user = new User(this, this.map);
        this.ghosts = [];
        this.ghostSpecs = Level.GHOST_OPTION.COLORS;
        this.ghosts = this.ghostSpecs.map(ghostColor => {
            return new Ghost(this, this.map, ghostColor);
        });
        this.dialog('Press N to start a new game');
        this.timer = window.setInterval(this.actionHandler.bind(this), 1000 / GENERAL.FPS);
    }

    onKeyDown(e) {
        if (e.keyCode === 78) {//N
            this.startNewGame();
        } else if (e.keyCode === 80/*P*/ && this.state === GENERAL.PAUSE) {
            this.map.draw(this.context);
            this.setState(this.stored);
        } else if (e.keyCode === 80/*P*/) {
            this.stored = this.state;
            this.setState(GENERAL.PAUSE);
            this.map.draw(ctx);
            this.dialog('Paused');
        } else if (this.state !== GENERAL.PAUSE) {
            return this.user.keyDown(e);
        }
        return true;
    }

    onKeyPress(e) {
        if (this.state !== GENERAL.WAITING && this.state !== GENERAL.PAUSE) {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    getTick() {
        return this.tick;
    }

    logScore(text, position) {
        const font = Level.FONTS.score;
        this.context.fillStyle = font.color;
        this.context.font = `${font.size}px ${font.family}`;
        this.context.fillText(text, (position['new']['x'] / 10) * this.map.blockSize, ((position['new']['y'] + 5) / 10) * this.map.blockSize);
    }

    dialog(text) {
        const font = Level.FONTS.dialogs;
        this.context.fillStyle = font.color;
        this.context.font = `${font.size}px ${font.family}`;
        let width = this.context.measureText(text).width,
            x = ((this.map.width * this.map.blockSize) - width) / 2;
        this.context.fillText(text, x, (this.map.height * 10) + 8);
    }

    startLevel() {
        this.user.resetPosition();
        this.ghosts.forEach(ghost=>ghost.reset());
        this.timerStart = this.tick;
        this.setState(GENERAL.COUNTDOWN);
    }

    startNewGame() {
        this.setState(GENERAL.WAITING);
        this.level = 1;
        this.user.reset();
        this.map.reset();
        this.map.draw();
        this.startLevel();
    }

    setState(state) {
        this.state = state;
        this.stateChanged = true;
    }

    looseLife() {
        this.setState(GENERAL.WAITING);
        this.user.looseLife();
        if (this.user.getLives() > 0) {
            this.startLevel();
        }
    }

    render() {
        let diff, user, i, len, nScore;

        this.ghostPositions = [];
        this.ghosts.forEach(ghost=> this.ghostPositions.push(ghost.move(this.context)));

        user = this.user.move(this.context);

        this.ghosts.forEach((ghost, index) => {
            this.renderBlock(this.ghostPositions[index].old);
        });
        this.renderBlock(user.old);

        this.ghosts.forEach(ghost => ghost.draw(this.context));
        this.user.draw(this.context);

        this.userPosition = user['new'];

        this.ghosts.forEach((ghost, index) => {
            if (this.collided(this.userPosition, this.ghostPositions[index]['new'])) {
                if (ghost.isVunerable()) {
                    ghost.eat();
                    this.eatenCount += 1;
                    nScore = this.eatenCount * 50;
                    this.logScore(nScore, this.ghostPositions[index]);
                    this.user.addScore(nScore);
                    this.setState(GENERAL.EATEN_PAUSE);
                    this.timerStart = this.tick;
                } else if (ghost.isDangerous()) {
                    this.setState(GENERAL.DYING);
                    this.timerStart = this.tick;
                }
            }
        }, this);
    }

    collided(user, ghost) {
        return (Math.sqrt(Math.pow(ghost.x - user.x, 2) +
                Math.pow(ghost.y - user.y, 2))) < 10;
    }

    renderBlock(position) {
        this.map.drawBlock(Math.floor(position.y / 10), Math.floor(position.x / 10));
        this.map.drawBlock(Math.ceil(position.y / 10), Math.ceil(position.x / 10));
    }

    actionHandler() {
        let diff;
        const STATES = GENERAL;
        if (this.state !== STATES.PAUSE) {
            this.tick = this.tick + 1;
        }
        this.map.drawPills();
        if (this.state === STATES.PLAYING) {
            this.render();
        } else if (this.state === STATES.WAITING && this.stateChanged) {
            this.stateChanged = false;
            this.map.draw();
            this.dialog('Press N to start a new game');
        } else if (this.state === STATES.EATEN_PAUSE && (this.tick - this.timerStart) > (GENERAL.FPS / 3)) {
            this.map.draw();
            this.setState(STATES.PLAYING);
        } else if (this.state === STATES.DYING) {
            if (this.tick - this.timerStart > (GENERAL.FPS * 2)) {
                this.looseLife();
            } else {
                this.renderBlock(this.userPosition);
                this.ghosts.forEach((ghost, index) => {
                    this.renderBlock(this.ghostPositions[index].old);
                    ghost.draw()
                });
                this.user.drawDead(this.context, (this.tick - this.timerStart) / (GENERAL.FPS * 2))
            }
        } else if (this.state === STATES.COUNTDOWN) {

            diff = 5 + Math.floor((this.timerStart - this.tick) / GENERAL.FPS);

            if (diff === 0) {
                this.map.draw();
                this.setState(STATES.PLAYING);
            } else {
                if (diff !== this.lastTime) {
                    this.lastTime = diff;
                    this.map.draw();
                    this.dialog('Starting in: ' + diff);
                }
            }
        }
        this.renderFooter();
    }

    eatenPill() {
        this.timerStart = this.tick;
        this.eatenCount = 0;
        this.ghosts.forEach(ghost => ghost.makeEatable(this.context));
    };

    completedLevel() {
        this.setState(GENERAL.WAITING);
        this.level += 1;
        this.map.reset();
        this.user.newLevel();
        this.startLevel();
    }

    renderFooter() {
        let topLeft = (this.map.height * this.map.blockSize),
            textBase = topLeft + 17;

        this.context.fillStyle = '#000000';
        this.context.fillRect(0, topLeft, (this.map.width * this.map.blockSize), 30);

        this.context.fillStyle = '#FFFF00';

        Array.from({length:this.user.getLives()}).forEach((x, i) => {
            this.context.fillStyle = '#FFFF00';
            this.context.beginPath();
            this.context.moveTo(150 + (25 * i) + this.map.blockSize / 2,
                (topLeft + 1) + this.map.blockSize / 2);

            this.context.arc(150 + (25 * i) + this.map.blockSize / 2,
                (topLeft + 1) + this.map.blockSize / 2,
                this.map.blockSize / 2, Math.PI * 0.25, Math.PI * 1.75, false);
            this.context.fill();
        }, this);

        this.context.fillStyle = '#FFFF00';
        this.context.font = '14px Arial';
        this.context.fillText('Score: ' + this.user.getScore(), 30, textBase);
        this.context.fillText('Level: ' + this.level, 260, textBase);
    }
}
export default Game;
