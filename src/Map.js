import {PACMAN} from './Constants';
import Level from './Level'
let BLOCK_SIZE = 10;
class Map {
    constructor(context, size = BLOCK_SIZE) {
        this.level = Level;
        this.context = context;
        this.blockSize = size;
        this.pillSize = 0;
        this.reset();
    }

    reset() {
        this.map = Object.assign({}, this.level.MAP);
        this.height = this.level.MAP.length;
        this.width = this.level.MAP[0].length;
    }

    withinBounds(x, y) {
        return y >= 0 && y < this.height && x >= 0 && x < this.width;
    }

    isWallSpace(position) {
        return this.withinBounds(position.x, position.y) && this.map[position.y][position.x] === PACMAN.WALL;
    }

    isFloorSpace(position) {
        if (!this.withinBounds(position.x, position.y)) {
            return false;
        }
        let piece = this.map[position.y][position.x];
        return piece === PACMAN.EMPTY || piece === PACMAN.CAKE || piece === PACMAN.PILL;
    }

    draw(context = this.context) {
        let i, j, size = this.blockSize;
        context.fillStyle = Level.GENERAL_OPTIONS.background;
        context.fillRect(0, 0, this.width * size, this.height * size);
        this.drawWall(context);
        for (i = 0; i < this.height; i++) {
            for (j = 0; j < this.width; j++) {
                this.drawBlock(i, j, context);
            }
        }
    }

    drawWall(context) {
        context.strokeStyle = this.level.WALLS_OPTION.strokeStyle;
        context.lineWidth = this.level.WALLS_OPTION.lineWidth;
        context.lineCap = this.level.WALLS_OPTION.lineCap;
        Level.WALLS.forEach((line)=> {
            context.beginPath();
            line.forEach((p) => {
                if (p.move) {
                    context.moveTo(p.move[0] * this.blockSize, p.move[1] * this.blockSize);
                } else if (p.line) {
                    context.lineTo(p.line[0] * this.blockSize, p.line[1] * this.blockSize);
                } else if (p.curve) {
                    context.quadraticCurveTo(p.curve[0] * this.blockSize,
                        p.curve[1] * this.blockSize,
                        p.curve[2] * this.blockSize,
                        p.curve[3] * this.blockSize);
                }
            });
            context.stroke();
        });
    }

    block(position) {
        return this.map[position.y][position.x];
    }

    setBlock(position, type) {
        this.map[position.y][position.x] = type;
    }

    getHeight() {
        return this.height;
    }

    getWidth() {
        return this.width;
    }

    drawPills(context = this.context) {
        let i, j;
        if (this.pillSize > 30) {
            this.pillSize = 0;
        }

        for (i = 0; i < this.height; i += 1) {
            for (j = 0; j < this.width; j += 1) {
                if (this.map[i][j] === PACMAN.PILL) {
                    context.beginPath();

                    context.fillStyle = Level.GENERAL_OPTIONS.background;
                    context.fillRect((j * this.blockSize), (i * this.blockSize),
                        this.blockSize, this.blockSize);

                    context.fillStyle = Level.GENERAL_OPTIONS.pillColor;
                    context.arc((j * this.blockSize) + this.blockSize / 2,
                        (i * this.blockSize) + this.blockSize / 2,
                        Math.abs(5 - (this.pillSize / 3)),
                        0,
                        Math.PI * 2, false);
                    context.fill();
                    context.closePath();
                }
            }
        }
    }
    getBlockSize(){
        return this.blockSize;
    }
    drawBlock(y, x, context = this.context) {
        let layout = this.map[y][x];

        if (layout === PACMAN.PILL) {
            return;
        }
        context.beginPath();
        if (layout === PACMAN.EMPTY || layout === PACMAN.BOX ||
            layout === PACMAN.CAKE || layout === PACMAN.BONUS) {

            context.fillStyle = Level.GENERAL_OPTIONS.background;
            context.fillRect((x * this.blockSize), (y * this.blockSize),
                this.blockSize, this.blockSize);

            if (layout === PACMAN.CAKE) {
                context.fillStyle = Level.GENERAL_OPTIONS.blockColor;
                context.fillRect((x * this.blockSize) + (this.blockSize / 2.5),
                    (y * this.blockSize) + (this.blockSize / 2.5),
                    this.blockSize / 6, this.blockSize / 6);
            }
        }
    }
}

export default Map;