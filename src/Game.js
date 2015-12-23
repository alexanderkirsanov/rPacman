import Level from './Level';
import {GENERAL} from './Constants';
import Map from './Map';
import User from './User';
import Ghost from './Ghost';
import Bonus from './Bonus';

class Game {
    constructor(context, blockSize, bonusWord = 'reltio') {
        this.tick = 0;
        this.context = context;
        this.map = new Map(context, blockSize);
        this.map.draw();
        this.user = new User(this, this.map);
        this.ghosts = [];
        this.level = 1;
        this.ghostSpecs = Level.GHOST_OPTION.COLORS;
        this.ghosts = this.ghostSpecs.map(ghostColor => {
            return new Ghost(this, this.map, ghostColor);
        });
        this.bonus = new Bonus(this, this.map, bonusWord);
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
            this.pause();
            this.dialog('Paused');
        } else if (this.state !== GENERAL.PAUSE) {
            return this.user.keyDown(e);
        }
        return true;
    }

    pause() {
        this.stored = this.state;
        this.setState(GENERAL.PAUSE);
        this.map.draw(this.context);
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

    dialog(text, font = Level.FONTS.dialogs, top) {
        this.context.fillStyle = font.color;
        this.context.font = `${font.size}px ${font.family}`;
        if (typeof text !== 'Array') {
            text = [text];
        }
        text.forEach((line, index) => {
            const measure = this.context.measureText(line);
            const width = measure.width,
                x = ((this.map.width * this.map.blockSize) - width) / 2;
            this.context.fillText(line, x, top || ((this.map.height * 10) + index * (font.size + 3)));
        });

    }

    showCard(context = this.context) {
        this.pause();
        const drawing = new Image();
        drawing.src = 'resources/title.png';
        drawing.onload = function () {
            context.drawImage(drawing, 60, 200);
        };
        this.dialog('Press P to continue', Level.FONTS.dialogs, 410);
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
        this.bonus.resetBonuses();
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
                    this.user.addScore(nScore);
                    this.setState(GENERAL.EATEN_PAUSE);
                    this.timerStart = this.tick;
                } else if (ghost.isDangerous()) {
                    this.setState(GENERAL.DYING);
                    this.timerStart = this.tick;
                }
            }
        }, this);
        this.bonus.draw(this.context);
        const bonusPosition = this.bonus.getPosition();
        if (bonusPosition) {
            if (this.collided(this.userPosition, bonusPosition)) {
                const bonus = this.bonus.getCurrent();
                this.bonus.eatBonus();
            }
        }
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
                    ghost.draw(this.context);
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
    }

    checkScore(score) {
        this.bonus.handleBonus(score);
    }

    completedLevel() {
        this.setState(GENERAL.WAITING);
        this.level += 1;
        this.map.reset();
        this.user.newLevel();
        this.startLevel();
    }

    renderFooter() {
        let topLeft = (this.map.height * this.map.blockSize),
            textBase = topLeft + 12;

        this.context.fillStyle = Level.GENERAL_OPTIONS.background;
        this.context.fillRect(0, topLeft, (this.map.width * this.map.blockSize), 80);

        this.context.fillStyle = '#FFFF00';
        this.context.font = '14px RubrikRegular';
        this.context.textAlign = 'start';
        this.context.fillText('Score', 40, textBase);
        textBase = textBase + 29;
        this.context.fillStyle = '#FFFFFF';
        this.context.font = '28px RubrikBold';
        this.context.textAlign = 'center';
        this.context.fillText(this.user.getScore(), 55, textBase);
        this.context.textAlign = 'start';
        Array.from({length: this.user.getLives()}).forEach((n, i) => {
            let size = this.map.blockSize,
                angle = {start: 0.25, end: 1.75, direction: false};
            const innerRadius = 0;
            const outerRadius = size / 2;
            const x = 170 + (25 * i) + this.map.blockSize / 2;
            const y = textBase - this.map.blockSize / 2;
            const gradient = this.context.createRadialGradient(x - this.map.blockSize * 0.02, y - this.map.blockSize * 0.02, innerRadius, x, y, outerRadius);
            gradient.addColorStop(0, GENERAL.color.PACMAN.start);
            gradient.addColorStop(1, GENERAL.color.PACMAN.end);
            this.context.fillStyle = gradient;
            this.context.beginPath();
            this.context.moveTo(x, y);
            this.context.arc(x, y, size / 2, Math.PI * angle.start, Math.PI * angle.end, angle.direction);
            this.context.fill();
            this.context.beginPath();
            this.context.fillStyle = GENERAL.color.PACMAN.eye;
            this.context.arc(x - size * 0.01, y - size / 4, size / 20, 0, 2 * Math.PI, false);
            this.context.fill();
        }, this);

        const bonus = this.bonus.getState();
        const bonusIndex = bonus.index;
        textBase = topLeft + 12;
        this.context.fillStyle = '#FFFF00';
        this.context.font = '14px RubrikRegular';
        this.context.textAlign = 'start';
        this.context.fillText('Bonus word', 309, textBase);
        textBase = textBase + 29;
        let xBase = 275;
        (bonus.array || []).forEach((item, index)=> {
            if (index <= bonusIndex) {
                this.context.fillStyle = item.fill;
            } else {
                this.context.fillStyle = '#1d1c43';
            }
            this.context.font = '30px RubrikMedium';
            const text = item.caption.toUpperCase();
            xBase += item.width || this.context.measureText(text).width;
            this.context.fillText(text, xBase, textBase);
        }, this);
        textBase = topLeft + 12;
        this.context.fillStyle = '#FFFF00';
        this.context.font = '14px RubrikRegular';
        this.context.textAlign = 'start';
        this.context.fillText('Level', 450, textBase);
        textBase = textBase + 29;
        this.context.fillStyle = '#FFFFFF';
        this.context.font = '28px RubrikBold';
        this.context.textAlign = 'center';
        this.context.fillText(String(this.level), 470, textBase);
        this.context.textAlign = 'start';
    }
}
export default Game;
