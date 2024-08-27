let selectedPiece = null;
let player = null;
let currentPlayer = null;
let board = [];
let selectedCount = 0;
const maxSelections = 5;
const boardElement = document.getElementById('board');
const logElement = document.getElementById('log');
const chatInput = document.getElementById('chatInput');
const chatBox = document.getElementById('chatBox');
const ws = new WebSocket('ws://localhost:5500');

ws.onmessage = (message) => {
    const data = JSON.parse(message.data);
    if (data.type === 'init') {
        player = data.player;
        alert(`You are player ${player}`);
        setupPieces();
    } else if (data.type === 'update') {
        board = data.board;
        currentPlayer = data.currentPlayer;
        document.getElementById('currentPlayerName').textContent = currentPlayer;
        updateBoard();
        updateLog(data.moveLog);
    } else if (data.type === 'chat') {
        updateChat(data.chatHistory);
    } else if (data.type === 'start') {
        alert('Game starting in 5 seconds!');
        setTimeout(() => {
            document.getElementById('readyButton').style.display = 'none';
            document.getElementById('resetButton').style.display = 'none';
            document.getElementById('pieces').style.display = 'none';
        }, 5000);
    } else if (data.type === 'error') {
        alert(data.message);
    }
};

function updateChat(chatHistory) {
    chatBox.innerHTML = '';
    chatHistory.forEach((chat) => {
        const chatEntry = document.createElement('div');
        chatEntry.textContent = chat;
        chatBox.appendChild(chatEntry);
    });
}

function sendChat() {
    const message = chatInput.value;
    ws.send(JSON.stringify({ type: 'chat', player, message }));
    chatInput.value = '';
}
for (let i = 0; i < 5; i++) {
    board[i] = [];
    for (let j = 0; j < 5; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', () => placePiece(i, j));
        board[i][j] = '';
        boardElement.appendChild(cell);
    }
}

function setupPieces() {
    if (player === 'Blue') {
        document.getElementById('redPawn').style.display = 'none';
        document.getElementById('redHero1').style.display = 'none';
        document.getElementById('redHero2').style.display = 'none';
    } else {
        document.getElementById('bluePawn').style.display = 'none';
        document.getElementById('blueHero1').style.display = 'none';
        document.getElementById('blueHero2').style.display = 'none';
    }
    updateBoard();
}

function selectPiece(piece) {
    if (selectedCount < maxSelections) {
        selectedPiece = piece;
    } else {
        alert('You can only select up to 5 pieces.');
    }
}

function move(direction, spaces = 1) {
    const piecePosition = findPiecePosition(selectedPiece);
    if (!piecePosition) return;

    const { row, col } = piecePosition;
    let newRow = row;
    let newCol = col;

    switch (direction) {
        case 'B':
            newRow += spaces;
            break;
        case 'F':
            newRow -= spaces;
            break;
        case 'L':
            newCol -= spaces;
            break;
        case 'R':
            newCol += spaces;
            break;
        case 'FL':
            newRow -= spaces;
            newCol -= spaces;
            break;
        case 'FR':
            newRow -= spaces;
            newCol += spaces;
            break;
        case 'BL':
            newRow += spaces;
            newCol -= spaces;
            break;
        case 'BR':
            newRow += spaces;
            newCol += spaces;
            break;
    }
    if (isValidMove(newRow, newCol)) {
        board[newRow][newCol] = selectedPiece;
        board[row][col] = '';
        updateBoard();
        ws.send(JSON.stringify({ type: 'move', player, from: { row, col }, to: { row: newRow, col: newCol }, spaces }));
        document.getElementById('moveMenu').style.display = 'none';
    } else {
        alert('Invalid move');
    }
}

function findPiecePosition(piece) {
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 5; j++) {
            if (board[i][j] === piece) {
                return { row: i, col: j };
            }
        }
    }
    return null;
}

function isValidMove(row, col) {
    return row >= 0 && row < 5 && col >= 0 && col < 5 && !board[row][col];
}

function ready() {
    ws.send(JSON.stringify({ type: 'ready', player }));
}

function resetBoard() {
    board = Array(5).fill().map(() => Array(5).fill(''));
    selectedCount = 0;
    updateBoard();
}
function updateLog(moveLog) {
    logElement.innerHTML = '';
    moveLog.forEach((log) => {
        const logEntry = document.createElement('div');
        logEntry.textContent = log;
        logElement.appendChild(logEntry);
    });
}
function placePiece(row, col) {
    const validRow = player === 'Blue' ? 4 : 0;
    if (selectedPiece && selectedCount < maxSelections && row === validRow) {
        board[row][col] = selectedPiece;
        selectedCount++;
        updateBoard();
    } else {
        alert('You can only place pieces on your starting row.');
    }
}


function updateBoard() {
    const cells = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 5);
        const col = index % 5;
        cell.textContent = board[row][col];
        cell.onclick = () => {
            if (board[row][col] && board[row][col][0] === player[0] && currentPlayer === player) {
                selectedPiece = board[row][col];
                document.getElementById('moveMenu').style.display = 'flex';
                updateMoveMenu(selectedPiece);
            }
        };
    });
}

function updateMoveMenu(piece) {
    const moveMenu = document.getElementById('moveMenu');
    const buttons = moveMenu.querySelectorAll('button');
    buttons.forEach(button => button.style.display = 'none');

    if (piece.endsWith('P')) {
        document.querySelector('button[onclick="move(\'B\')"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'F\')"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'L\')"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'R\')"]').style.display = 'block';
    } else if (piece.endsWith('H1') || piece.endsWith('H2')) {
        document.querySelector('button[onclick="move(\'B\', 1)"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'B\', 2)"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'F\', 1)"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'F\', 2)"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'L\', 1)"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'L\', 2)"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'R\', 1)"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'R\', 2)"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'FL\', 1)"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'FL\', 2)"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'FR\', 1)"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'FR\', 2)"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'BL\', 1)"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'BL\', 2)"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'BR\', 1)"]').style.display = 'block';
        document.querySelector('button[onclick="move(\'BR\', 2)"]').style.display = 'block';
    }
}