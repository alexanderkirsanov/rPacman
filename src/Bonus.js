import Level from './Level.js';
class Bonus {
    constructor(game, map, bonusString = '') {
        this.game = game;
        this.map = map;
        this.bonusString = bonusString;
        this.index = 0;
        this.resetBonuses();
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
        if (score - this.oldScore > 100 && !this.currentBonus && this.index < this.bonusArray.length) {
            this.oldScore = score;
            this.currentBonus = this.bonusArray[this.index];
            this.position = this.calculateBonusPosition(this.map);
            this.index += 1;
        }
    }

    calculateBonusPosition(map){
        return map.getFreeCell();
    }
    eatBonus(){
        this.currentBonus = null;
        this.position = null;
    }
    draw(context){
        if (this.position){
            context.beginPath();
            const {x,y} = this.position;
            context.fillStyle = Level.GENERAL_OPTIONS.background;
            context.fillRect((y * this.blockSize), (x * this.blockSize),
                this.blockSize, this.blockSize);

            context.fillStyle = Level.GENERAL_OPTIONS.pillColor;
            const font = Level.FONTS.bonus;
            const text = this.currentBonus;
            context.font = `${font.size}px ${font.family}`;
            context.fillText(text, y * this.blockSize, x* this.blockSize);
        }
    }
}

export default Bonus;