import PACMAN from 'Constants';
class Map {
    constructor(size) {
        let {height, width} = size;
        this.height = height;
        this.width = width;
    }

    withinBounds(x, y) {
        return y >= 0 && y < this.height && x >= 0 && x < this.width;
    }

    isWall(position) {
        this.withinBounds(position.x, position.y) && this.map[position.x][position.y] === PACMAN.WALL;
    }
}

export default Map;