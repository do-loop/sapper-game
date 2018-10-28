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