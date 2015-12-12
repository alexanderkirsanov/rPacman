import Level from './Level';
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

}
