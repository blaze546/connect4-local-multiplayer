const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let gameState = {
    board: Array.from({ length: 6 }, () => Array(7).fill(null)),
    currentPlayer: 'purple'
};

wss.on('connection', (ws) => {
    ws.send(JSON.stringify(gameState));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'move') {
            gameState.board[data.row][data.col] = gameState.currentPlayer;
            if (checkWin(gameState.board, gameState.currentPlayer)) {
                gameState.winner = gameState.currentPlayer;
            }
            gameState.currentPlayer = gameState.currentPlayer === 'purple' ? 'yellow' : 'purple';
            broadcast(JSON.stringify(gameState));
        } else if (data.type === 'reset') {
            gameState = {
                board: Array.from({ length: 6 }, () => Array(7).fill(null)),
                currentPlayer: 'purple'
            };
            broadcast(JSON.stringify(gameState));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

function checkWin(board, player) {
    const directions = [
        { row: 1, col: 0 }, // Vertical
        { row: 0, col: 1 }, // Horizontal
        { row: 1, col: 1 }, // Diagonal /
        { row: 1, col: -1 } // Diagonal \
    ];

    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 7; col++) {
            if (board[row][col] === player) {
                for (const { row: rowDir, col: colDir } of directions) {
                    let count = 1;
                    for (let i = 1; i < 4; i++) {
                        const newRow = row + i * rowDir;
                        const newCol = col + i * colDir;
                        if (newRow >= 0 && newRow < 6 && newCol >= 0 && newCol < 7 && board[newRow][newCol] === player) {
                            count++;
                        } else {
                            break;
                        }
                    }
                    if (count === 4) return true;
                }
            }
        }
    }
    return false;
}

app.use(express.static('public'));

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});


