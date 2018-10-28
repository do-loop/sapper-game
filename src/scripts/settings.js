class Settings {
    constructor(width, height, mines) {
        this.width = width;
        this.height = height;
        this.mines = mines;
    }
    getWidth() {
        return this.width;
    }
    getHeight() {
        return this.height;
    }
    getMines() {
        return this.mines;
    }
}