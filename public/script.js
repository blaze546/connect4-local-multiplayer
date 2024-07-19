const rows = 6;
const columns = 7;
let gameState;
let currentPlayer;

const boardElement = document.getElementById('board');
const messageElement = document.getElementById('message');
const modal = document.getElementById('winnerModal');
const winnerMessageElement = document.getElementById('winnerMessage');
const closeModal = document.getElementById('closeModal');

const socket = new WebSocket('ws://localhost:3000');

socket.onmessage = (event) => {
    gameState = JSON.parse(event.data);
    updateBoardFromState();
    messageElement.textContent = `Player ${gameState.currentPlayer}'s turn`;
};

socket.onopen = () => {
    console.log('Connected to the server');
};

function createBoard() {
    boardElement.innerHTML = '';
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.addEventListener('click', handleClick);
            boardElement.appendChild(cell);
        }
    }
}

function handleClick(event) {
    const col = parseInt(event.target.dataset.col);
    for (let row = rows - 1; row >= 0; row--) {
        if (!gameState.board[row][col]) {
            socket.send(JSON.stringify({ type: 'move', row, col }));
            return;
        }
    }
}

function updateBoardFromState() {
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const cell = boardElement.querySelector(`.cell[data-row='${row}'][data-col='${col}']`);
            if (gameState.board[row][col]) {
                cell.classList.add(gameState.board[row][col]);
            } else {
                cell.classList.remove('purple', 'yellow');
            }
        }
    }
    if (checkWin()) {
        winnerMessageElement.textContent = `Player ${gameState.currentPlayer === 'purple' ? 'yellow' : 'purple'} wins!`;
        modal.style.display = "block";
        closeModal.addEventListener('click', closeModalHandler);
    }
}

function checkWin() {
    const directions = [
        { row: 1, col: 0 }, // Vertical
        { row: 0, col: 1 }, // Horizontal
        { row: 1, col: 1 }, // Diagonal /
        { row: 1, col: -1 } // Diagonal \
    ];

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const player = gameState.board[row][col];
            if (player) {
                for (const { row: rowDir, col: colDir } of directions) {
                    let count = 1;
                    for (let i = 1; i < 4; i++) {
                        const newRow = row + i * rowDir;
                        const newCol = col + i * colDir;
                        if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < columns && gameState.board[newRow][newCol] === player) {
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

function closeModalHandler() {
    modal.style.display = "none";
    socket.send(JSON.stringify({ type: 'reset' }));
}

createBoard();




