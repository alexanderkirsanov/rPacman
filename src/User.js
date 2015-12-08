import {GENERAL, KEY} from './Constants'
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
    }

    addScore(score) {
        this.score += score;
        if (this.score >= 10000 && this.score - score < 10000) {
            this.lives += 1;
        }
    }
}