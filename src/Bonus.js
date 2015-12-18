import Level from './Level.js';
class Bonus {
    constructor(game, map, bonusString = '') {
        this.game = game;
        this.map = map;
        this.bonusString = bonusString;
        this.index = 0;
    }

    resetBonuses() {
        this.oldScore = 0;
        this.bonusArray = this.bonusString.split('').map((bonusItem, index) => {
            return {
                caption: bonusItem,
                fill: Level.GENERAL_OPTIONS.bonusColors[index % Level.GENERAL_OPTIONS.bonusColors.length]
            }
        });
    }

    handleBonus(score) {
        if (score - this.oldScore > 1000 && !this.currentBonus && this.index < this.bonusArray.length) {
            this.oldScore = score;
            this.currentBonus = this.bonusArray[this.index];
            this.position = this.calculateBonusPosition(this.map);
            this.index += 1;
        }
    }

    calculateBonusPosition(map){
        return map.getFreeCell();
    }
}

export default Bonus;