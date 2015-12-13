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
        this.timer = window.setInterval(this.actionHandler, 1000 / GENERAL.FPS);
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
        this.setState(Level.GENERAL_OPTIONS.COUNTDOWN);
    }

    startNewGame() {
        this.setState(Level.GENERAL_OPTIONS.WAITING);
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
        this.setState(Level.GENERAL_OPTIONS.WAITING);
        this.user.looseLife();
        if (this.user.getLives() > 0) {
            this.startLevel();
        }
    }

    actionHandler() {
        let diff;
        const STATES = Level.GENERAL_OPTIONS;
        if (this.state !== STATES.PAUSE) {
            this.tick = this.tick + 1;
        }
        this.map.drawPills();
        if (this.state === STATES.WAITING && this.stateChanged) {
            this.stateChanged = false;
            this.map.draw();
            dialog('Press N to start a new game');
        } else if (this.state === STATES.EATEN_PAUSE && (this.tick - this.timerStart) > (GENERAL.FPS / 3)) {
            this.map.draw();
            this.setState(STATES.PLAYING);
        } else if (this.state = STATES.DYING) {
            if (this.tick - this.timerStart > (GENERAL.FPS * 2)) {
                this.looseLife();
            } else {
                this.renderBlock(this.userPos);
                this.ghosts.forEach((ghost, index) => {
                    this.renderBlock(this.ghostPositions[index].old);
                    ghost.draw()
                });
                this.user.drawDead(this.context, (this.tick - this.timerStart) / (GENERAL.FPS * 2))
            }
        }
    }

}
export default Game;
