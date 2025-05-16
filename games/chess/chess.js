// Chess Game JavaScript

// Load key bindings and prevent scrolling
let keyBindings = {
    undo: 'z'
};

// Prevent scrolling with arrow keys
window.addEventListener('keydown', function(e) {
    // Prevent default behavior for arrow keys and space
    if([32, 37, 38, 39, 40].indexOf(e.keyCode) > -1) {
        e.preventDefault();
    }
});

// Load user key bindings if available
function loadKeyBindings() {
    if (localStorage.getItem('projectKataPreferences')) {
        const preferences = JSON.parse(localStorage.getItem('projectKataPreferences'));
        if (preferences.keyBindings && preferences.keyBindings.chess) {
            keyBindings = preferences.keyBindings.chess;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    // Load key bindings
    loadKeyBindings();
    // DOM elements
    const chessBoard = document.getElementById('chess-board');
    const statusElement = document.getElementById('status');
    const turnElement = document.getElementById('turn');
    const resetButton = document.getElementById('reset-button');
    const undoButton = document.getElementById('undo-button');
    const playAgainButton = document.getElementById('play-again');
    const gameOverModal = document.getElementById('game-over');
    const gameResultElement = document.getElementById('game-result');
    const promotionModal = document.getElementById('promotion-modal');
    const promotionPieces = document.querySelectorAll('.promotion-piece');
    const whiteCapturedElement = document.getElementById('white-captured-pieces');
    const blackCapturedElement = document.getElementById('black-captured-pieces');
    
    // Game state
    let board = [];
    let selectedPiece = null;
    let currentTurn = 'white';
    let validMoves = [];
    let moveHistory = [];
    let whiteCaptured = [];
    let blackCaptured = [];
    let kings = { white: null, black: null };
    let inCheck = { white: false, black: false };
    let gameOver = false;
    let waitingForPromotion = null;
    
    // Piece symbols
    const PIECES = {
        'white-pawn': '♙',
        'white-rook': '♖',
        'white-knight': '♘',
        'white-bishop': '♗',
        'white-queen': '♕',
        'white-king': '♔',
        'black-pawn': '♟',
        'black-rook': '♜',
        'black-knight': '♞',
        'black-bishop': '♝',
        'black-queen': '♛',
        'black-king': '♚'
    };
    
    // Initialize the game
    function init() {
        // Clear the board
        chessBoard.innerHTML = '';
        board = [];
        selectedPiece = null;
        currentTurn = 'white';
        validMoves = [];
        moveHistory = [];
        whiteCaptured = [];
        blackCaptured = [];
        kings = { white: null, black: null };
        inCheck = { white: false, black: false };
        gameOver = false;
        waitingForPromotion = null;
        
        // Update UI
        updateStatus();
        updateCapturedPieces();
        
        // Create the chess board
        createBoard();
        
        // Set up the pieces
        setupPieces();
        
        // Check for check
        checkForCheck();
    }
    
    // Create the chess board
    function createBoard() {
        for (let row = 0; row < 8; row++) {
            const boardRow = [];
            for (let col = 0; col < 8; col++) {
                const square = document.createElement('div');
                square.classList.add('square');
                square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
                square.dataset.row = row;
                square.dataset.col = col;
                
                // Add rank and file labels
                if (col === 0) {
                    const rankLabel = document.createElement('span');
                    rankLabel.classList.add('rank-label');
                    rankLabel.textContent = 8 - row;
                    square.appendChild(rankLabel);
                }
                
                if (row === 7) {
                    const fileLabel = document.createElement('span');
                    fileLabel.classList.add('file-label');
                    fileLabel.textContent = String.fromCharCode(97 + col); // 'a' through 'h'
                    square.appendChild(fileLabel);
                }
                
                square.addEventListener('click', handleSquareClick);
                chessBoard.appendChild(square);
                boardRow.push({ piece: null, element: square });
            }
            board.push(boardRow);
        }
    }
    
    // Set up the chess pieces
    function setupPieces() {
        // Set up pawns
        for (let col = 0; col < 8; col++) {
            placePiece(1, col, 'black-pawn');
            placePiece(6, col, 'white-pawn');
        }
        
        // Set up rooks
        placePiece(0, 0, 'black-rook');
        placePiece(0, 7, 'black-rook');
        placePiece(7, 0, 'white-rook');
        placePiece(7, 7, 'white-rook');
        
        // Set up knights
        placePiece(0, 1, 'black-knight');
        placePiece(0, 6, 'black-knight');
        placePiece(7, 1, 'white-knight');
        placePiece(7, 6, 'white-knight');
        
        // Set up bishops
        placePiece(0, 2, 'black-bishop');
        placePiece(0, 5, 'black-bishop');
        placePiece(7, 2, 'white-bishop');
        placePiece(7, 5, 'white-bishop');
        
        // Set up queens
        placePiece(0, 3, 'black-queen');
        placePiece(7, 3, 'white-queen');
        
        // Set up kings
        placePiece(0, 4, 'black-king');
        placePiece(7, 4, 'white-king');
        
        // Store king positions
        kings.black = { row: 0, col: 4 };
        kings.white = { row: 7, col: 4 };
    }
    
    // Place a piece on the board
    function placePiece(row, col, pieceType) {
        const pieceElement = document.createElement('div');
        pieceElement.classList.add('piece');
        pieceElement.textContent = PIECES[pieceType];
        pieceElement.dataset.pieceType = pieceType;
        
        board[row][col].piece = {
            type: pieceType,
            element: pieceElement,
            hasMoved: false
        };
        
        board[row][col].element.appendChild(pieceElement);
    }
    
    // Handle square click
    function handleSquareClick(event) {
        if (gameOver || waitingForPromotion) return;
        
        const square = event.currentTarget;
        const row = parseInt(square.dataset.row);
        const col = parseInt(square.dataset.col);
        
        // If a piece is already selected
        if (selectedPiece) {
            // Check if the clicked square is a valid move
            const isValidMove = validMoves.some(move => move.row === row && move.col === col);
            
            if (isValidMove) {
                // Move the piece
                movePiece(selectedPiece.row, selectedPiece.col, row, col);
                
                // Deselect the piece
                clearSelection();
            } else {
                // Check if the clicked square has a piece of the current player's color
                const piece = board[row][col].piece;
                if (piece && piece.type.startsWith(currentTurn)) {
                    // Select the new piece
                    clearSelection();
                    selectPiece(row, col);
                } else {
                    // Deselect the piece
                    clearSelection();
                }
            }
        } else {
            // Check if the clicked square has a piece of the current player's color
            const piece = board[row][col].piece;
            if (piece && piece.type.startsWith(currentTurn)) {
                // Select the piece
                selectPiece(row, col);
            }
        }
    }
    
    // Select a piece
    function selectPiece(row, col) {
        selectedPiece = { row, col };
        board[row][col].element.classList.add('selected');
        
        // Get valid moves for the selected piece
        validMoves = getValidMoves(row, col);
        
        // Highlight valid moves
        validMoves.forEach(move => {
            board[move.row][move.col].element.classList.add('valid-move');
        });
    }
    
    // Clear selection
    function clearSelection() {
        if (selectedPiece) {
            board[selectedPiece.row][selectedPiece.col].element.classList.remove('selected');
            selectedPiece = null;
        }
        
        // Remove valid move highlights
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                board[row][col].element.classList.remove('valid-move');
            }
        }
        
        validMoves = [];
    }
    
    // Get valid moves for a piece
    function getValidMoves(row, col) {
        const piece = board[row][col].piece;
        if (!piece) return [];
        
        const pieceType = piece.type.split('-')[1];
        const color = piece.type.split('-')[0];
        let moves = [];
        
        switch (pieceType) {
            case 'pawn':
                moves = getPawnMoves(row, col, color);
                break;
            case 'rook':
                moves = getRookMoves(row, col, color);
                break;
            case 'knight':
                moves = getKnightMoves(row, col, color);
                break;
            case 'bishop':
                moves = getBishopMoves(row, col, color);
                break;
            case 'queen':
                moves = getQueenMoves(row, col, color);
                break;
            case 'king':
                moves = getKingMoves(row, col, color);
                break;
        }
        
        // Filter out moves that would put or leave the king in check
        return moves.filter(move => !wouldBeInCheck(row, col, move.row, move.col, color));
    }
    
    // Check if a move would put or leave the king in check
    function wouldBeInCheck(fromRow, fromCol, toRow, toCol, color) {
        // Make a deep copy of the board
        const boardCopy = JSON.parse(JSON.stringify(board.map(row => row.map(cell => ({ piece: cell.piece ? { type: cell.piece.type, hasMoved: cell.piece.hasMoved } : null })))));
        
        // Make the move on the copy
        const piece = boardCopy[fromRow][fromCol].piece;
        const capturedPiece = boardCopy[toRow][toCol].piece;
        boardCopy[toRow][toCol].piece = piece;
        boardCopy[fromRow][fromCol].piece = null;
        
        // Update king position if the king is moving
        const kingPos = { ...kings[color] };
        if (piece.type === `${color}-king`) {
            kingPos.row = toRow;
            kingPos.col = toCol;
        }
        
        // Check if the king would be in check
        return isInCheck(boardCopy, kingPos, color);
    }
    
    // Check if a king is in check
    function isInCheck(boardState, kingPos, color) {
        const opponentColor = color === 'white' ? 'black' : 'white';
        
        // Check for attacks from pawns
        const pawnDirections = color === 'white' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]];
        for (const [rowDir, colDir] of pawnDirections) {
            const checkRow = kingPos.row + rowDir;
            const checkCol = kingPos.col + colDir;
            
            if (checkRow >= 0 && checkRow < 8 && checkCol >= 0 && checkCol < 8) {
                const checkPiece = boardState[checkRow][checkCol].piece;
                if (checkPiece && checkPiece.type === `${opponentColor}-pawn`) {
                    return true;
                }
            }
        }
        
        // Check for attacks from knights
        const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        for (const [rowDir, colDir] of knightMoves) {
            const checkRow = kingPos.row + rowDir;
            const checkCol = kingPos.col + colDir;
            
            if (checkRow >= 0 && checkRow < 8 && checkCol >= 0 && checkCol < 8) {
                const checkPiece = boardState[checkRow][checkCol].piece;
                if (checkPiece && checkPiece.type === `${opponentColor}-knight`) {
                    return true;
                }
            }
        }
        
        // Check for attacks from bishops, rooks, and queens (along lines)
        const directions = [
            [-1, -1], [-1, 0], [-1, 1], // Up-left, Up, Up-right
            [0, -1], [0, 1],            // Left, Right
            [1, -1], [1, 0], [1, 1]     // Down-left, Down, Down-right
        ];
        
        for (const [rowDir, colDir] of directions) {
            let checkRow = kingPos.row + rowDir;
            let checkCol = kingPos.col + colDir;
            
            while (checkRow >= 0 && checkRow < 8 && checkCol >= 0 && checkCol < 8) {
                const checkPiece = boardState[checkRow][checkCol].piece;
                
                if (checkPiece) {
                    if (checkPiece.type.startsWith(opponentColor)) {
                        const checkPieceType = checkPiece.type.split('-')[1];
                        
                        // Diagonal directions (bishop, queen)
                        if (Math.abs(rowDir) === 1 && Math.abs(colDir) === 1) {
                            if (checkPieceType === 'bishop' || checkPieceType === 'queen') {
                                return true;
                            }
                        }
                        // Straight directions (rook, queen)
                        else if (rowDir === 0 || colDir === 0) {
                            if (checkPieceType === 'rook' || checkPieceType === 'queen') {
                                return true;
                            }
                        }
                    }
                    
                    // Stop checking in this direction if we hit any piece
                    break;
                }
                
                checkRow += rowDir;
                checkCol += colDir;
            }
        }
        
        // Check for attacks from the opponent's king
        const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        for (const [rowDir, colDir] of kingMoves) {
            const checkRow = kingPos.row + rowDir;
            const checkCol = kingPos.col + colDir;
            
            if (checkRow >= 0 && checkRow < 8 && checkCol >= 0 && checkCol < 8) {
                const checkPiece = boardState[checkRow][checkCol].piece;
                if (checkPiece && checkPiece.type === `${opponentColor}-king`) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    // Get valid moves for a pawn
    function getPawnMoves(row, col, color) {
        const moves = [];
        const direction = color === 'white' ? -1 : 1;
        const startRow = color === 'white' ? 6 : 1;
        
        // Move forward one square
        if (row + direction >= 0 && row + direction < 8 && !board[row + direction][col].piece) {
            moves.push({ row: row + direction, col });
            
            // Move forward two squares from the starting position
            if (row === startRow && !board[row + 2 * direction][col].piece) {
                moves.push({ row: row + 2 * direction, col });
            }
        }
        
        // Capture diagonally
        const captureDirections = [[direction, -1], [direction, 1]];
        for (const [rowDir, colDir] of captureDirections) {
            const newRow = row + rowDir;
            const newCol = col + colDir;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = board[newRow][newCol].piece;
                if (targetPiece && targetPiece.type.startsWith(color === 'white' ? 'black' : 'white')) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }
    
    // Get valid moves for a rook
    function getRookMoves(row, col, color) {
        const moves = [];
        const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // Up, Down, Left, Right
        
        for (const [rowDir, colDir] of directions) {
            let newRow = row + rowDir;
            let newCol = col + colDir;
            
            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = board[newRow][newCol].piece;
                
                if (!targetPiece) {
                    // Empty square
                    moves.push({ row: newRow, col: newCol });
                } else if (targetPiece.type.startsWith(color === 'white' ? 'black' : 'white')) {
                    // Opponent's piece
                    moves.push({ row: newRow, col: newCol });
                    break;
                } else {
                    // Own piece
                    break;
                }
                
                newRow += rowDir;
                newCol += colDir;
            }
        }
        
        return moves;
    }
    
    // Get valid moves for a knight
    function getKnightMoves(row, col, color) {
        const moves = [];
        const knightMoves = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
        
        for (const [rowDir, colDir] of knightMoves) {
            const newRow = row + rowDir;
            const newCol = col + colDir;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = board[newRow][newCol].piece;
                
                if (!targetPiece || targetPiece.type.startsWith(color === 'white' ? 'black' : 'white')) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }
    
    // Get valid moves for a bishop
    function getBishopMoves(row, col, color) {
        const moves = [];
        const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // Diagonals
        
        for (const [rowDir, colDir] of directions) {
            let newRow = row + rowDir;
            let newCol = col + colDir;
            
            while (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = board[newRow][newCol].piece;
                
                if (!targetPiece) {
                    // Empty square
                    moves.push({ row: newRow, col: newCol });
                } else if (targetPiece.type.startsWith(color === 'white' ? 'black' : 'white')) {
                    // Opponent's piece
                    moves.push({ row: newRow, col: newCol });
                    break;
                } else {
                    // Own piece
                    break;
                }
                
                newRow += rowDir;
                newCol += colDir;
            }
        }
        
        return moves;
    }
    
    // Get valid moves for a queen
    function getQueenMoves(row, col, color) {
        // Queen moves like a rook and bishop combined
        return [...getRookMoves(row, col, color), ...getBishopMoves(row, col, color)];
    }
    
    // Get valid moves for a king
    function getKingMoves(row, col, color) {
        const moves = [];
        const kingMoves = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        
        for (const [rowDir, colDir] of kingMoves) {
            const newRow = row + rowDir;
            const newCol = col + colDir;
            
            if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
                const targetPiece = board[newRow][newCol].piece;
                
                if (!targetPiece || targetPiece.type.startsWith(color === 'white' ? 'black' : 'white')) {
                    moves.push({ row: newRow, col: newCol });
                }
            }
        }
        
        return moves;
    }
    
    // Move a piece
    function movePiece(fromRow, fromCol, toRow, toCol) {
        const piece = board[fromRow][fromCol].piece;
        const pieceType = piece.type.split('-')[1];
        const color = piece.type.split('-')[0];
        
        // Store the move in history
        const capturedPiece = board[toRow][toCol].piece;
        moveHistory.push({
            from: { row: fromRow, col: fromCol },
            to: { row: toRow, col: toCol },
            piece,
            capturedPiece,
            firstMove: !piece.hasMoved
        });
        
        // Handle capture
        if (capturedPiece) {
            if (capturedPiece.type.startsWith('white')) {
                whiteCaptured.push(capturedPiece.type);
            } else {
                blackCaptured.push(capturedPiece.type);
            }
            updateCapturedPieces();
        }
        
        // Move the piece
        board[toRow][toCol].piece = piece;
        board[fromRow][fromCol].piece = null;
        board[toRow][toCol].element.appendChild(piece.element);
        
        // Mark the piece as moved
        piece.hasMoved = true;
        
        // Update king position if the king moved
        if (pieceType === 'king') {
            kings[color] = { row: toRow, col: toCol };
        }
        
        // Check for pawn promotion
        if (pieceType === 'pawn' && (toRow === 0 || toRow === 7)) {
            waitingForPromotion = { row: toRow, col: toCol, color };
            showPromotionDialog();
        } else {
            // Switch turns
            currentTurn = currentTurn === 'white' ? 'black' : 'white';
            updateStatus();
            
            // Check for check and checkmate
            checkForCheck();
            checkForCheckmate();
        }
    }
    
    // Show pawn promotion dialog
    function showPromotionDialog() {
        promotionModal.style.display = 'flex';
    }
    
    // Promote a pawn
    function promotePawn(pieceType) {
        if (!waitingForPromotion) return;
        
        const { row, col, color } = waitingForPromotion;
        const newPieceType = `${color}-${pieceType}`;
        
        // Remove the pawn
        const pawn = board[row][col].piece;
        board[row][col].element.removeChild(pawn.element);
        
        // Place the new piece
        placePiece(row, col, newPieceType);
        
        // Update the move history
        const lastMove = moveHistory[moveHistory.length - 1];
        lastMove.promotion = newPieceType;
        
        // Hide the promotion dialog
        promotionModal.style.display = 'none';
        waitingForPromotion = null;
        
        // Switch turns
        currentTurn = currentTurn === 'white' ? 'black' : 'white';
        updateStatus();
        
        // Check for check and checkmate
        checkForCheck();
        checkForCheckmate();
    }
    
    // Check if a king is in check
    function checkForCheck() {
        // Reset check status
        inCheck.white = false;
        inCheck.black = false;
        
        // Remove check highlights
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                board[row][col].element.classList.remove('check');
            }
        }
        
        // Check if white king is in check
        inCheck.white = isInCheck(board, kings.white, 'white');
        if (inCheck.white) {
            board[kings.white.row][kings.white.col].element.classList.add('check');
        }
        
        // Check if black king is in check
        inCheck.black = isInCheck(board, kings.black, 'black');
        if (inCheck.black) {
            board[kings.black.row][kings.black.col].element.classList.add('check');
        }
        
        updateStatus();
    }
    
    // Check for checkmate
    function checkForCheckmate() {
        const currentColor = currentTurn;
        
        // If the current player is in check
        if (inCheck[currentColor]) {
            // Check if any move can get the king out of check
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = board[row][col].piece;
                    if (piece && piece.type.startsWith(currentColor)) {
                        const moves = getValidMoves(row, col);
                        if (moves.length > 0) {
                            // There's at least one valid move
                            return;
                        }
                    }
                }
            }
            
            // No valid moves found, it's checkmate
            gameOver = true;
            const winner = currentColor === 'white' ? 'Black' : 'White';
            gameResultElement.textContent = `${winner} wins by checkmate!`;
            gameOverModal.style.display = 'flex';
        } else {
            // Check for stalemate (no valid moves but not in check)
            let hasValidMove = false;
            
            for (let row = 0; row < 8; row++) {
                for (let col = 0; col < 8; col++) {
                    const piece = board[row][col].piece;
                    if (piece && piece.type.startsWith(currentColor)) {
                        const moves = getValidMoves(row, col);
                        if (moves.length > 0) {
                            hasValidMove = true;
                            break;
                        }
                    }
                }
                if (hasValidMove) break;
            }
            
            if (!hasValidMove) {
                // Stalemate
                gameOver = true;
                gameResultElement.textContent = 'Stalemate! The game is a draw.';
                gameOverModal.style.display = 'flex';
            }
        }
    }
    
    // Undo the last move
    function undoMove() {
        if (moveHistory.length === 0 || waitingForPromotion) return;
        
        const lastMove = moveHistory.pop();
        const { from, to, piece, capturedPiece, firstMove } = lastMove;
        
        // Move the piece back
        board[from.row][from.col].piece = piece;
        board[to.row][to.col].piece = capturedPiece;
        board[from.row][from.col].element.appendChild(piece.element);
        
        // Restore captured piece if any
        if (capturedPiece) {
            board[to.row][to.col].element.appendChild(capturedPiece.element);
            
            // Remove from captured list
            if (capturedPiece.type.startsWith('white')) {
                whiteCaptured.pop();
            } else {
                blackCaptured.pop();
            }
            updateCapturedPieces();
        }
        
        // Restore piece's first move status
        piece.hasMoved = !firstMove;
        
        // Update king position if the king moved
        if (piece.type.endsWith('king')) {
            const color = piece.type.split('-')[0];
            kings[color] = { row: from.row, col: from.col };
        }
        
        // Switch turns back
        currentTurn = currentTurn === 'white' ? 'black' : 'white';
        updateStatus();
        
        // Check for check
        checkForCheck();
        
        // Reset game over state
        gameOver = false;
        gameOverModal.style.display = 'none';
    }
    
    // Update the game status display
    function updateStatus() {
        let status = `${currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1)}'s turn`;
        
        if (inCheck[currentTurn]) {
            status += ' (in check)';
        }
        
        statusElement.textContent = status;
        turnElement.textContent = currentTurn.charAt(0).toUpperCase() + currentTurn.slice(1);
    }
    
    // Update the captured pieces display
    function updateCapturedPieces() {
        whiteCapturedElement.innerHTML = '';
        blackCapturedElement.innerHTML = '';
        
        whiteCaptured.forEach(pieceType => {
            const pieceElement = document.createElement('span');
            pieceElement.textContent = PIECES[pieceType];
            whiteCapturedElement.appendChild(pieceElement);
        });
        
        blackCaptured.forEach(pieceType => {
            const pieceElement = document.createElement('span');
            pieceElement.textContent = PIECES[pieceType];
            blackCapturedElement.appendChild(pieceElement);
        });
    }
    
    // Event listeners
    resetButton.addEventListener('click', init);
    undoButton.addEventListener('click', undoMove);
    playAgainButton.addEventListener('click', () => {
        init();
        gameOverModal.style.display = 'none';
    });
    
    // Keyboard event listener for undo
    document.addEventListener('keydown', (event) => {
        if (event.key === keyBindings.undo) {
            undoMove();
        }
    });
    
    promotionPieces.forEach(piece => {
        piece.addEventListener('click', () => {
            promotePawn(piece.dataset.piece);
        });
    });
    
    // Initialize the game
    init();
});
