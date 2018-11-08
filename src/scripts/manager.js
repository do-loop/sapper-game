class GameManager {
    constructor(game) {
        this.game = game;
    }
    tag(position) {
        if (this.game.getState() === GameState.Finished)
            return;
        this.game.tag(position);
        this._update();
    }
    open(position) {
        if (this.game.getState() === GameState.Finished)
            return;
        if (this.game.getState() === GameState.Stopped) {
            this.game.generate(position);
            this.game.start();
        }
        this.game.open(position);
        if (this.game.getState() == GameState.Finished)
            this._display();
        this._update();
    }
    play() {
        this.game.reset()
        this._create();
        this._update();
    }
    _display() {
        this.game.openMatrix();
    }
    _create() {
        const game = $.getById("game");
        game.createTBody();
        const matrix = this.game.getMatrix();
        for (let i = 0; i < this.game.getHeight(); i++) {
            game.insertRow();
            for (let j = 0; j < this.game.getWidth(); j++) {
                const position =  matrix[i][j].getPosition();
                const cell = game.rows[i].insertCell();
                $.setId(cell, position.toString());
                $.setClass($.getById(position.toString()), this._getClass(matrix[i][j]));
                this._setButtonActions(cell, position);
                $.setValue(cell, this._getValue(matrix[i][j]));
            }
        }
    }
    _setButtonActions(cell, position) {
        cell.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            gameManager.tag(position);
        }, false);
        cell.addEventListener("click", () => {
            gameManager.open(position);
        }, false);
    }
    _update() {
        const matrix = this.game.getMatrix();
        for (let i = 0; i < this.game.getHeight(); i++) {
            for (let j = 0; j < this.game.getWidth(); j++) {
                const position = matrix[i][j].getPosition();
                const cell = $.getById(position.toString());
                $.setClass(cell, this._getClass(matrix[i][j]));
                $.setValue(cell, this._getValue(matrix[i][j]));
            }
        }
        const gameResult = this.game.getResult();
        const message = $.getById("message");
        switch (gameResult) {
            case GameResult.Victory:
                $.setValue(message, "Победа!");
                break;
            case GameResult.Defeat:
                $.setValue(message, "Поражение!");
                break;
        }
    }
    _getClass(cell) {
        switch (cell.getState()) {
            case CellState.Closed: return "cell cell-closed";
            case CellState.Opened: return "cell cell-opened";
            case CellState.Tagged: return "cell cell-tagged";
            case CellState.Broken: return "cell cell-broken";
        }
    }
    _getValue(cell) {
        switch (cell.getType()) {
            case CellType.Empty:
            case CellType.Mine:
                return "";
            case CellType.Number: {
                switch (cell.getState()) {
                    case CellState.Closed:
                    case CellState.Tagged:
                    case CellState.Broken:
                        return "";
                    default:
                        return cell.getValue();
                }
            }
        }
    }
}