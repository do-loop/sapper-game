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
            if (neighbor.getType() !== CellType.Mine)
                neighbor.setValue(neighbor.getValue() + 1);
        }
        if (position.y - 1 >= 0) {
            const neighbor = this.matrix[position.y - 1][position.x];
            if (neighbor.getType() !== CellType.Mine)
                neighbor.setValue(neighbor.getValue() + 1);
        }
        if (position.y - 1 >= 0 && position.x + 1 < width) {
            const neighbor = this.matrix[position.y - 1][position.x + 1];
            if (neighbor.getType() !== CellType.Mine)
                neighbor.setValue(neighbor.getValue() + 1);
        }
        if (position.x + 1 < width) {
            const neighbor = this.matrix[position.y][position.x + 1];
            if (neighbor.getType() !== CellType.Mine)
                neighbor.setValue(neighbor.getValue() + 1);
        }
        if (position.y + 1 < height && position.x + 1 < width) {
            const neighbor = this.matrix[position.y + 1][position.x + 1];
            if (neighbor.getType() !== CellType.Mine)
                neighbor.setValue(neighbor.getValue() + 1);
        }
        if (position.y + 1 < height) {
            const neighbor = this.matrix[position.y + 1][position.x];
            if (neighbor.getType() !== CellType.Mine)
                neighbor.setValue(neighbor.getValue() + 1);
        }
        if (position.y + 1 < height && position.x - 1 >= 0) {
            const neighbor = this.matrix[position.y + 1][position.x - 1];
            if (neighbor.getType() !== CellType.Mine)
                neighbor.setValue(neighbor.getValue() + 1);
        }
        if (position.x - 1 >= 0) {
            const neighbor = this.matrix[position.y][position.x - 1];
            if (neighbor.getType() !== CellType.Mine)
                neighbor.setValue(neighbor.getValue() + 1);
        }
    }
}