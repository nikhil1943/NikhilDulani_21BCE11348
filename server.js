const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 5500 });

let players = [];
let board = Array(5).fill().map(() => Array(5).fill(''));
let currentPlayer = 'Blue';
let moveLog = [];
let chatHistory = [];
let readyPlayers = 0;

wss.on('connection', (ws) => {
    if (players.length < 2) {
        players.push(ws);
        ws.send(JSON.stringify({ type: 'init', player: players.length === 1 ? 'Blue' : 'Red' }));
    } else {
        ws.close();
    }

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'move') {
            const result = handleMove(data);
            if (result.valid) {
                moveLog.push(`${data.player} moved from (${data.from.row}, ${data.from.col}) to (${data.to.row}, ${data.to.col})`);
                broadcast(JSON.stringify({ type: 'update', board, currentPlayer, moveLog, chatHistory }));
                checkWinCondition();
            } else {
                ws.send(JSON.stringify({ type: 'error', message: result.message }));
            }
        } else if (data.type === 'chat') {
            chatHistory.push(`${data.player}: ${data.message}`);
            broadcast(JSON.stringify({ type: 'chat', chatHistory }));
        } else if (data.type === 'ready') {
            readyPlayers++;
            if (readyPlayers === 2) {
                setTimeout(() => {
                    broadcast(JSON.stringify({ type: 'start' }));
                }, 5000);
            }
        }
    });

    ws.on('close', () => {
        players = players.filter(player => player !== ws);
    });
});

function handleMove(data) {
    const { player, from, to } = data;
    if (player !== currentPlayer) return { valid: false, message: 'Not your turn' };

    const piece = board[from.row][from.col];
    if (!piece) return { valid: false, message: 'No piece at the specified location' };
    if (piece[0] !== player[0]) return { valid: false, message: 'Cannot move opponent\'s piece' };

    const validMove = validateMove(piece, from, to);
    if (!validMove) return { valid: false, message: 'Invalid move' };

    board[to.row][to.col] = piece;
    board[from.row][from.col] = '';
    currentPlayer = currentPlayer === 'Blue' ? 'Red' : 'Blue';
    return { valid: true };
}

function validateMove(piece, from, to) {
    const rowDiff = to.row - from.row;
    const colDiff = to.col - from.col;

    if (to.row < 0 || to.row >= 5 || to.col < 0 || to.col >= 5) return false;
    if (board[to.row][to.col] && board[to.row][to.col][0] === piece[0]) return false;
    switch (piece) {
        case 'BP':
        case 'RP':
            return Math.abs(rowDiff) <= 1 && Math.abs(colDiff) <= 1;
        case 'BH1':
        case 'RH1':
            return Math.abs(rowDiff) <= 2 && Math.abs(colDiff) <= 2 && (rowDiff === 0 || colDiff === 0);
        case 'BH2':
        case 'RH2':
            return Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2;
        default:
            return false;
    }
}

function checkWinCondition() {
    const bluePieces = board.flat().filter(piece => piece.startsWith('B')).length;
    const redPieces = board.flat().filter(piece => piece.startsWith('R')).length;

    if (bluePieces === 0) {
        broadcast(JSON.stringify({ type: 'win', winner: 'Red' }));
    } else if (redPieces === 0) {
        broadcast(JSON.stringify({ type: 'win', winner: 'Blue' }));
    }
}

function broadcast(message) {
    players.forEach(player => player.send(message));
}
