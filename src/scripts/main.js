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

const settings = new Settings(15, 15, 5);
const game = new Game(settings);
const gameManager = new GameManager(game);

gameManager.play();