const $ = {
    getById: selector =>
        document.getElementById(selector),
    getByClass: selector =>
        document.getElementByClassName(selector),
    setId: (element, id) =>
        element.setAttribute("id", id),
    setClass: (element, _class) =>
        element.setAttribute("class", _class),
    setClick: (element, action) =>
        element.setAttribute("onclick", action),
    setContextMenu: (element, action) =>
        element.setAttribute("oncontextmenu", action),
    setValue: (element, value) =>
        element.innerText = value,
    getRandom: (max) =>
        Math.round(Math.random() * max)
};

const GameState = {
    Stopped     : 1,
    Started     : 3,
    Finished    : 3
};

const CellType = {
    Empty   : 1,
    Number  : 2,
    Mine    : 3
};

const CellState = {
    Closed  : 1,
    Tagged  : 2,
    Opened  : 3,
    Broken  : 4
};

const ActionType = {
    Opening : 1,
    Tagging : 2
};

const GameResult = {
    Unknown : 1,
    Victory : 2,
    Defeat  : 3
}

class Position {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    toString() {
        return `${this.y}-${this.x}`;
    }
}

class Cell {
    constructor(position, type) {
        this.position = position;
        this.type = type || CellType.Empty;
        this.state = CellState.Closed;
        this.value = 0;
    }
    open() {
        switch (this.type) {
            case CellType.Empty:
            case CellType.Number:
                this.state = CellState.Opened;
                break;
            case CellType.Mine:
                this.state = CellState.Broken;
                break;
            case CellType.Closed:
                break;
        }
        return this;
    }
    tag() {
        this.state = this.state === CellState.Tagged
            ? CellState.Closed
            : CellState.Tagged;
        return this;
    }
    getState() {
        return this.state;
    }
    setState(state) {
        this.state = state;
    }
    getType() {
        return this.type;
    }
    setType(type) {
        this.type = type;
    }
    getPosition() {
        return this.position;
    }
    getValue() {
        return this.value;
    }
    setValue(value) {
        if (this.type !== CellType.Number)
            this.type = CellType.Number;
        this.value = value;
    }
}

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

class Game {
    constructor(settings) {
        this.state = GameState.Stopped;
        this.settings = settings;
        this.result = GameResult.Unknown;
    }
    reset() {
        this.state = GameState.Stopped;
        this.result = GameResult.Unknown;
        this.matrix = [];
        this.visits = [];
        for (let y = 0; y < this.settings.getHeight(); y++) {
            this.matrix[y] = [];
            this.visits[y] = [];
            for (let x = 0; x < this.settings.getWidth(); x++) {
                this.matrix[y][x] = new Cell(new Position(x, y));
                this.visits[y][x] = false;
            }
        }
        return this;
    }
    generate(position) {
        this._generateMines(position);
        return this;
    }
    start() {
        this.state = CellState.Started;
    }
    open(position) {
        const cell = this._getCell(position);
        const state = cell.getState();
        if (state == CellState.Opened)
            return;
        this._processAction(cell, ActionType.Opening);
        const type = cell.getType();
        if (type === CellType.Mine || this._isFinished()) {
            this.result = type === CellType.Mine
                ? GameResult.Defeat
                : GameResult.Victory;
            this.state = GameState.Finished;
        }
    }
    tag(position) {
        const cell = this._getCell(position);
        if (cell.getState() == CellState.Opened)
            return;
        this._processAction(cell, ActionType.Tagging);
    }
    openMatrix() {
        for (let y = 0; y < this.settings.getHeight(); y++) {
            for (let x = 0; x < this.settings.getWidth(); x++) {
                const cell = this.matrix[y][x];
                switch (cell.getType()) {
                    case CellType.Mine:
                        cell.setState(CellState.Broken);
                        break;
                    default:
                        cell.setState(CellState.Opened);
                        break;  
                }
            }
        }
    }
    getState() {
        return this.state;
    }
    getMatrix() {
        return this.matrix;
    }
    getWidth() {
        return this.settings.getWidth();
    }
    getHeight() {
        return this.settings.getHeight();
    }
    getResult() {
        return this.result;
    }
    _getCell(position) {
        return this.matrix[position.y][position.x];
    }
    _processAction(cell, action) {
        switch (action) {
            case ActionType.Opening: {
                const type = cell.getType();
                if (type === CellType.Mine || type === CellType.Number) {
                    cell.open();
                    break;
                }
                this._openInternal(cell);
                break;
            }
            case ActionType.Tagging:
                cell.tag();
                break;
        }
    }
    _openInternal(cell) {
        const type = cell.getType();
        const current = cell.getPosition();
        if (type !== CellType.Empty || this.visits[current.y][current.x] === true) {
            if (type !== CellType.Mine)
                cell.open();
            return;
        }
        cell.open();
        const width = this.settings.getWidth();
        const height = this.settings.getHeight();
        this.visits[current.y][current.x] = true;
        if (current.y - 1 >= 0 && current.x - 1 >= 0) {
            const position = new Position(current.x - 1, current.y - 1);
            const neighbor = this._getCell(position);
            this._openInternal(neighbor);
        }
        if (current.y - 1 >= 0) {
            const position = new Position(current.x, current.y - 1);
            const neighbor = this._getCell(position);
            this._openInternal(neighbor);
        }
        if (current.y - 1 >= 0 && current.x + 1 < width) {
            const position = new Position(current.x + 1, current.y - 1);
            const neighbor = this._getCell(position);
            this._openInternal(neighbor);
        }
        if (current.x + 1 < width) {
            const position = new Position(current.x + 1, current.y);
            const neighbor = this._getCell(position);
            this._openInternal(neighbor);
        }
        if (current.y + 1 < height && current.x + 1 < width) {
            const position = new Position(current.x + 1, current.y + 1);
            const neighbor = this._getCell(position);
            this._openInternal(neighbor);
        }
        if (current.y + 1 < height) {
            const position = new Position(current.x, current.y + 1);
            const neighbor = this._getCell(position);
            this._openInternal(neighbor);
        }
        if (current.y + 1 < height && current.x - 1 >= 0) {
            const position = new Position(current.x - 1, current.y + 1);
            const neighbor = this._getCell(position);
            this._openInternal(neighbor);
        }
        if (current.x - 1 >= 0) {
            const position = new Position(current.x - 1, current.y);
            const neighbor = this._getCell(position);
            this._openInternal(neighbor);
        }
    }
    _isFinished() {
        let counter = 0;
        const height = this.settings.getHeight();
        const width = this.settings.getWidth();
        const mines = this.settings.getMines();
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const cell = this.matrix[y][x];
                const state = cell.getState();
                if (cell.getType() !== CellType.Mine)
                    if (state === CellState.Opened)
                        counter++;
            }
        }
        return (height * width) - counter === mines;
    }
    _generateMines(position) {
        let mines = this.settings.getMines();
        while (mines > 0) {
            const x = $.getRandom(this.settings.getWidth() - 1);
            const y = $.getRandom(this.settings.getHeight() - 1);
            const cell = this.matrix[y][x];
            if (cell.getType() !== CellType.Mine) {
                // Чтобы не создать мину в клетке, где было первое нажатие.
                if (position.x != x && position.y != y) {
                    this._generateMinesInternal(cell);
                    mines--;
                }
            }
        }
    }
    _generateMinesInternal(cell) {
        cell.setType(CellType.Mine);
        const position = cell.getPosition(); 
        const width = this.settings.getWidth();
        const height = this.settings.getHeight();
        if (position.y - 1 >= 0 && position.x - 1 >= 0) {
            const neighbor = this.matrix[position.y - 1][position.x - 1];
            if (neighbor.getType() != CellType.Mine)
                neighbor.setValue(neighbor.getValue() + 1);
        }
        if (position.y - 1 >= 0) {
            const neighbor = this.matrix[position.y - 1][position.x];
            if (neighbor.getType() != CellType.Mine)
                neighbor.setValue(neighbor.getValue() + 1);
        }
        if (position.y - 1 >= 0 && position.x + 1 < width) {
            const neighbor = this.matrix[position.y - 1][position.x + 1];
            if (neighbor.getType() != CellType.Mine)
                neighbor.setValue(neighbor.getValue() + 1);
        }
        if (position.x + 1 < width) {
            const neighbor = this.matrix[position.y][position.x + 1];
            if (neighbor.getType() != CellType.Mine)
                neighbor.setValue(neighbor.getValue() + 1);
        }
        if (position.y + 1 < height && position.x + 1 < width) {
            const neighbor = this.matrix[position.y + 1][position.x + 1];
            if (neighbor.getType() != CellType.Mine)
                neighbor.setValue(neighbor.getValue() + 1);
        }
        if (position.y + 1 < height)  {
            const neighbor = this.matrix[position.y + 1][position.x];
            if (neighbor.getType() != CellType.Mine)
                neighbor.setValue(neighbor.getValue() + 1);
        }
        if (position.y + 1 < height && position.x - 1 >= 0)  {
            const neighbor = this.matrix[position.y + 1][position.x - 1];
            if (neighbor.getType() != CellType.Mine)
                neighbor.setValue(neighbor.getValue() + 1);
        }
        if (position.x - 1 >= 0)  {
            const neighbor = this.matrix[position.y][position.x - 1];
            if (neighbor.getType() != CellType.Mine)
                neighbor.setValue(neighbor.getValue() + 1);
        }
    }
}

class GameManager {
    constructor(game) {
        this.game = game;
    }
    tag(position) {
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
        this._update();
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
                // TODO: Убрать эти вызовы.
                $.setClick(cell, `gameManager.open(new Position(${position.x}, ${position.y}))`);
                $.setContextMenu(cell, `gameManager.tag(new Position(${position.x}, ${position.y}))`);
                $.setValue(cell, this._getValue(matrix[i][j]));
            }
        }
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
        switch (gameResult) {
            case GameResult.Victory:
                console.log("Победа!");
                break;
            case GameResult.Defeat:
                console.log("Поражение!");
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

const settings = new Settings(15, 15, 5);
const game = new Game(settings);
const gameManager = new GameManager(game);

gameManager.play();