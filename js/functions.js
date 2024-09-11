function isLower(char) {
    const charCode = char.charCodeAt(0);
    return charCode >= 97 && charCode <= 122;
}

function generatePrecomputedMoves() {
    for (let f = 0; f < files.length; f++) {
        for (let r = 0; r < ranks.length; r++) {

            let toUp = ranks.length - 1 - r;
            let toDown = r;
            let toLeft = f;
            let toRight = files.length - 1 - f;

            let squareIndex = r * ranks.length + f;

            let upLeft = Math.min(toUp, toLeft);
            let downRight = Math.min(toDown, toRight);
            let upRight = Math.min(toUp, toRight);
            let downLeft = Math.min(toDown, toLeft);

            numSquaresToEdge[squareIndex] = [
                toUp,
                toDown,
                toLeft,
                toRight,
                upLeft,
                downRight,
                upRight,
                downLeft
            ];
        }
    }
}

function generateMoves() {
    let generatedMoves = [];
    let length = ranks.length * files.length; // 64
    for (let startIndex = 0; startIndex < length; startIndex++) {
        let piece = board.Squares[startIndex];
        if (Piece.isColor(piece, board.ColorToMove)) {
            if (Piece.isSlidingPiece(piece)) { // Queen, Rook, Bishop 
                let slidingMoves = generateSlidingMoves(startIndex, piece);
                generatedMoves = generatedMoves.concat(slidingMoves);
            }
            else if (Piece.isType(piece, Piece.Pawn)) {
                let pawnMoves = generateMovesForPawn(piece, startIndex);
                generatedMoves = generatedMoves.concat(pawnMoves);
            }
            else if (Piece.isType(piece, Piece.Knight)) {
                let knightMoves = generateMovesForKnight(piece, startIndex);
                generatedMoves = generatedMoves.concat(knightMoves);
            }
            else if (Piece.isType(piece, Piece.King)) {
                let kingMoves = generateMovesForKing(piece, startIndex);
                generatedMoves = generatedMoves.concat(kingMoves);
            }
        }
    }
    return generatedMoves;
}

function getIndexexOfPiece(pieceType, pieceColor) {
    let indexes = [];
    for (let i = 0; i < board.Squares.length; i++) {
        const element = board.Squares[i];
        if (Piece.isType(element, pieceType) && Piece.isColor(element, pieceColor))
            indexes.push(i);
    }
    return indexes;
}

function isSquareAttacked(squareIndex, color) {
    // Check for attacks from pawns
    const pawnAttacks = (color === Piece.White) ? [7, 9] : [-9, -7];
    let pawnIndexes = getIndexexOfPiece(Piece.Pawn, color);
    for (const index of pawnIndexes) {
        let yes = false;
        for (let k = 0; k < pawnAttacks.length; k++) {
            const attack = pawnAttacks[k];
            if (parseInt(index) + parseInt(attack) === parseInt(squareIndex)) {
                return true;
            }
        }
    };

    // Check for attacks from knights
    const knightMoves = [6, 10, 15, 17, -6, -10, -15, -17];
    for (const move of knightMoves) {
        const attackedSquareIndex = squareIndex + move;
        if (board.Squares[attackedSquareIndex] !== undefined && board.Squares[attackedSquareIndex].piece === Piece.Knight && board.Squares[attackedSquareIndex].color === color) {
            return true;
        }
    }

    // Check for attacks from bishops and queens along diagonals
    const bishopDirections = [-7, -9, 7, 9];
    for (const direction of bishopDirections) {
        let attackedSquareIndex = squareIndex + direction;
        while (board.Squares[attackedSquareIndex] !== undefined) {
            if (board.Squares[attackedSquareIndex].piece === Piece.Bishop || board.Squares[attackedSquareIndex].piece === Piece.Queen) {
                if (board.Squares[attackedSquareIndex].color === color) {
                    return true;
                } else {
                    break;
                }
            } else if (board.Squares[attackedSquareIndex].piece !== Piece.None) {
                break;
            }
            attackedSquareIndex += direction;
        }
    }

    // Check for attacks from rooks and queens along files and ranks
    const rookDirections = [-8, -1, 1, 8];
    for (const direction of rookDirections) {
        let attackedSquareIndex = squareIndex + direction;
        while (board.Squares[attackedSquareIndex] !== undefined) {
            if (board.Squares[attackedSquareIndex].piece === Piece.Rook || board.Squares[attackedSquareIndex].piece === Piece.Queen) {
                if (board.Squares[attackedSquareIndex].color === color) {
                    return true;
                } else {
                    break;
                }
            } else if (board.Squares[attackedSquareIndex].piece !== Piece.None) {
                break;
            }
            attackedSquareIndex += direction;
        }
    }

    // Check for attacks from kings
    const kingMoves = [1, 7, 8, 9, -1, -7, -8, -9];
    for (const move of kingMoves) {
        const attackedSquareIndex = squareIndex + move;
        if (board.Squares[attackedSquareIndex] !== undefined && board.Squares[attackedSquareIndex].piece === Piece.King && board.Squares[attackedSquareIndex].color === color) {
            return true;
        }
    }

    return false;
}

function generateSlidingMoves(startIndex, piece) {
    let generatedMoves = [];
    let startDirIndex = (Piece.isType(piece, Piece.Bishop)) ? 4 : 0;
    let endDirIndex = (Piece.isType(piece, Piece.Rook)) ? 4 : 8;

    for (let directionIndex = startDirIndex; directionIndex < endDirIndex; directionIndex++) {
        for (let n = 0; n < numSquaresToEdge[startIndex][directionIndex]; n++) {
            let targetSquare = startIndex + directionOffsets[directionIndex] * (n + 1);
            let pieceOnTargetSquare = board.Squares[targetSquare];

            // if there is a piece in the same color in target square, you cannot go more
            if (Piece.isColor(pieceOnTargetSquare, board.ColorToMove))
                break;

            generatedMoves.push(new Move(startIndex, targetSquare));

            // if there is a piece in the OPPOSITE color in target square, you cannot go more
            if (Piece.isColor(pieceOnTargetSquare, Piece.reverseColor(board.ColorToMove)))
                break;
        }
    }
    return generatedMoves;
}

function checkEnPassant(startIndex, captureIndex, direction, direction2) {
    let length = board.MovesPlayed.length;
    if (length == 0) return;

    const lastMove = board.MovesPlayed[length - 1];
    let targetSquare = lastMove.targetSquare;
    if (parseInt(targetSquare) + (direction * 8) == captureIndex && Math.abs(parseInt(targetSquare) - startIndex) == 1
        && numSquaresToEdge[startIndex][direction2] > 0 && Math.abs(targetSquare - lastMove.startSquare) === 16 && board.getRankOfIndex(startIndex) == board.getRankOfIndex(targetSquare) &&
        board.Squares[startIndex].color != board.Squares[targetSquare].color && Math.abs(targetSquare - lastMove.startSquare) == 16) {
        return true;
    }
    return false;
}

function generateMovesForPawn(piece, startIndex) {
    const generatedMoves = [];
    const direction = Piece.isColor(piece, Piece.White) ? 1 : -1;

    const nextIndex1 = startIndex + direction * 8;
    if (nextIndex1 < BOARD_SIZE && nextIndex1 >= 0) {
        // Check if the square in front of the pawn is empty
        if (board.Squares[nextIndex1].piece === Piece.None) {
            generatedMoves.push(new Move(startIndex, nextIndex1));
        }

        let directionToSide1 = 2;
        let directionToSide2 = 3;
        if (piece.color === Piece.Black) {
            directionToSide1 = 3;
            directionToSide2 = 2;
        }

        // Check if there is a piece to capture diagonally to the left of the pawn
        const leftCaptureIndex = startIndex + direction * 7;
        if ((leftCaptureIndex >= 0 && leftCaptureIndex < BOARD_SIZE &&
            board.Squares[leftCaptureIndex].piece !== Piece.None &&
            numSquaresToEdge[startIndex][directionToSide1] > 0 &&
            Piece.isColor(board.Squares[leftCaptureIndex], Piece.reverseColor(piece.color))) || checkEnPassant(startIndex, leftCaptureIndex, direction, directionToSide1)) {
            generatedMoves.push(new Move(startIndex, leftCaptureIndex));
        }

        // Check if there is a piece to capture diagonally to the right of the pawn
        const rightCaptureIndex = startIndex + direction * 9;
        if ((rightCaptureIndex >= 0 && rightCaptureIndex < BOARD_SIZE &&
            board.Squares[rightCaptureIndex].piece !== Piece.None &&
            numSquaresToEdge[startIndex][directionToSide2] > 0 &&
            Piece.isColor(board.Squares[rightCaptureIndex], Piece.reverseColor(piece.color))) || checkEnPassant(startIndex, rightCaptureIndex, direction, directionToSide2)) {
            generatedMoves.push(new Move(startIndex, rightCaptureIndex));
        }
    }

    const nextIndex2 = startIndex + direction * 16;
    if (!piece.hasMoved && nextIndex2 < BOARD_SIZE && nextIndex2 >= 0 && board.Squares[nextIndex2].piece === Piece.None && board.Squares[startIndex + direction * 8].piece === Piece.None) {
        generatedMoves.push(new Move(startIndex, nextIndex2));
    }

    return generatedMoves;
}

function generateMovesForKnight(piece, startIndex) {
    const generatedMoves = [];

    for (const direction of directionsForKnight) {
        const nextIndex = startIndex + direction;
        if (nextIndex >= 0 && nextIndex < BOARD_SIZE) {
            // Check if the knight can move to the next square in this direction
            if ((direction === -17 || direction === -15 || direction === 15 || direction === 17) &&
                (Math.floor(startIndex / 8) === Math.floor(nextIndex / 8) - 2 ||
                    Math.floor(startIndex / 8) === Math.floor(nextIndex / 8) + 2)) {
                // Knight moves two rows up or down and one column to the left or right
                if (board.Squares[nextIndex].piece === Piece.None || Piece.isColor(board.Squares[nextIndex], Piece.reverseColor(piece.color))) {
                    generatedMoves.push(new Move(startIndex, nextIndex));
                }
            } else if ((direction === -10 || direction === -6 || direction === 6 || direction === 10) &&
                (Math.floor(startIndex / 8) === Math.floor(nextIndex / 8) - 1 ||
                    Math.floor(startIndex / 8) === Math.floor(nextIndex / 8) + 1)) {
                // Knight moves one row up or down and two columns to the left or right
                if (board.Squares[nextIndex].piece === Piece.None || Piece.isColor(board.Squares[nextIndex], Piece.reverseColor(piece.color))) {
                    generatedMoves.push(new Move(startIndex, nextIndex));
                }
            }
        }
    }

    return generatedMoves;
}

function generateMovesForKing(piece, startIndex) {
    const generatedMoves = [];

    // Check if the king can castle
    if (board.Squares[0].hasMoved) {
        board.WhiteCanCastleToQueenSide = false;
    }
    if (board.Squares[7].hasMoved) {
        board.WhiteCanCastleToKingSide = false;
    }
    if (board.Squares[63].hasMoved) {
        board.BlackCanCastleToKingSide = false;
    }
    if (board.Squares[56].hasMoved) {
        board.BlackCanCastleToQueenSide = false;
    }

    if (!piece.hasMoved) {
        // Check if there are no pieces between the king and rook
        if (piece.color === Piece.White) {
            // Check if King is not checked
            if (!board.WhiteKingIsChecked) {
                if (board.Squares[0].piece === Piece.Rook && !board.isPieceOnSquare(1) && !board.isPieceOnSquare(2) && !board.isPieceOnSquare(3) &&
                    !board.Squares[0].hasMoved) {
                    // Queenside castle for white
                    if (!isSquareAttacked(2, Piece.Black) && !isSquareAttacked(3, Piece.Black)) {
                        generatedMoves.push(new Move(startIndex, 2));
                    }
                }
                if (board.Squares[7].piece === Piece.Rook && !board.isPieceOnSquare(5) && !board.isPieceOnSquare(6) &&
                    !board.Squares[7].hasMoved) {
                    // Kingside castle for white
                    if (!isSquareAttacked(5, Piece.Black) && !isSquareAttacked(6, Piece.Black)) {
                        generatedMoves.push(new Move(startIndex, 6));
                    }
                }
            }
        }
        else {
            // Check if King is not checked
            if (!board.BlackKingIsChecked) {
                if (board.Squares[63].piece === Piece.Rook && !board.isPieceOnSquare(61) && !board.isPieceOnSquare(62) &&
                    !board.Squares[63].hasMoved) {
                    // Kingside castle for black
                    if (!isSquareAttacked(61, Piece.White) && !isSquareAttacked(62, Piece.White)) {
                        generatedMoves.push(new Move(startIndex, 62));
                    }
                }
                if (board.Squares[56].piece === Piece.Rook && !board.isPieceOnSquare(57) && !board.isPieceOnSquare(58) && !board.isPieceOnSquare(59) &&
                    !board.Squares[56].hasMoved) {
                    // Queenside castle for black
                    if (!isSquareAttacked(board, 58, Piece.White) && !isSquareAttacked(board, 59, Piece.White)) {
                        generatedMoves.push(new Move(startIndex, 58));
                    }
                }
            }
        }
    }
    else {
        if (piece.color == Piece.White) {
            board.WhiteCanCastleToKingSide = false;
            board.WhiteCanCastleToQueenSide = false;
        } else {
            board.BlackCanCastleToKingSide = false;
            board.BlackCanCastleToQueenSide = false;
        }
    }

    // Generate regular moves
    for (const direction of directionOffsets) {
        const nextIndex = startIndex + direction;
        if (nextIndex >= 0 && nextIndex < BOARD_SIZE) {
            if (Math.abs(startIndex % 8 - nextIndex % 8) <= 1 && Math.abs(Math.floor(startIndex / 8) - Math.floor(nextIndex / 8)) <= 1) {
                if (board.Squares[nextIndex].piece === Piece.None || Piece.isColor(board.Squares[nextIndex], Piece.reverseColor(piece.color))) {
                    generatedMoves.push(new Move(startIndex, nextIndex));
                }
            }
        }
    }

    return generatedMoves;
}

function getPieceSourceByClass(myclass) {
    let arr = myclass.split('-');
    let color = arr[0].charAt(0);
    let piece = arr[1].charAt(0).toUpperCase();
    if (arr[1] === "knight")
        piece = 'N';
    return selectedPieceStyleSource[color + piece];
}

function showPossibleMoves(startSquareIndex) {
    moves.forEach(move => {
        if (move.startSquare == startSquareIndex) {
            let square = document.getElementById(move.targetSquare);
            if (square.querySelector(".piece")) { // if there is a piece on the square
                square.classList.add("capture-move");
            }
            else {
                square.innerHTML = "<section class='possible-move'></section>"
            }
        }
    });
}

function clearPossibleMoves() {
    var elements = document.querySelectorAll(".possible-move");

    for (var i = 0; i < elements.length; i++) {
        elements[i].remove();
    }

    var elements2 = document.querySelectorAll(".capture-move");
    for (let k = 0; k < elements2.length; k++) {
        const element = elements2[k];
        element.classList.remove("capture-move");
    }
}

function removeAllEventListeners() {
    const elements = document.querySelectorAll('*');
    elements.forEach(element => {
        const clone = element.cloneNode(true);
        element.parentNode.replaceChild(clone, element);
    });
}

function showBoardInConsole() {
    // let aside = document.getElementById("aside");
    // aside.innerHTML = '';
    for (let row = ranks.length - 1; row >= 0; row--) {
        let rowStr = '';
        for (let col = 0; col < files.length; col++) {
            const index = row * ranks.length + col;
            const pieceNum = board.Squares[index];
            const pieceSymbol = Piece.getUnicode(pieceNum);
            if (pieceSymbol === "")
                rowStr += "\u2001";
            else
                rowStr += pieceSymbol;
        }
        // aside.innerHTML += rowStr;
        // aside.innerHTML += "<br/>"
        // console.log(rowStr); 
    }
}

function changeViewAfterMove(oldSquare, element, itemBeingDragged) { // element can be a piece or a square
    oldSquare.innerHTML = stringEmpty;
    if (element.parentNode.classList.contains("square")) { // it means element is a piece, so we will change it to square to drop dragged piece there
        element = element.parentNode;
    }
    if (itemBeingDragged?.classList.contains("piece")) {
        while (element.firstChild) { // element is new square
            element.removeChild(element.firstChild);
        }
        element.appendChild(itemBeingDragged);
    }
}

function isCapture(move) {
    if (Piece.reverseColor(board.Squares[move.startSquare].color) === board.Squares[move.targetSquare].color)
        return true;
    return false;
}

function getPieceLetter(piece) {
    let letter;

    if (Piece.isType(piece, Piece.Pawn))
        letter = "p";
    else if (Piece.isType(piece, Piece.Knight))
        letter = "n";
    else if (Piece.isType(piece, Piece.Bishop))
        letter = "b";
    else if (Piece.isType(piece, Piece.Rook))
        letter = "r";
    else if (Piece.isType(piece, Piece.Queen))
        letter = "q";
    else if (Piece.isType(piece, Piece.King))
        letter = "k";
    else
        letter = "";

    if (Piece.isColor(piece, Piece.White))
        letter = letter.toUpperCase();

    return letter;
}

// function replaceConsecutiveAmpersands(str) {
//     return str.replace(/&+/g, (match) => match.length.toString());
// }

// function getFen() {
//     let fen = "";
//     let index = 56;
//     for (let i = 0; i < board.Squares.length; i++) {
//         if (index >= 0 && index <= BOARD_SIZE) {
//             const element = board.Squares[index];
//             if (element.piece == Piece.None) {
//                 fen += "&";
//             } else {
//                 fen += getPieceLetter(element);
//             }
//             if ((index + 1) % 8 == 0 && index != 7) {
//                 fen += "/";
//                 index -= 16;
//             }
//         }
//         index++;
//     }
//     fen += " ";
//     if (board.ColorToMove == Piece.White) {
//         fen += "w";
//     } else {
//         fen += "b";
//     }
//     // let added = false;
//     // if (board.WhiteCanCastleToKingSide) {
//     //     fen += "K";
//     //     added = true;
//     // }
//     // if (board.WhiteCanCastleToQueenSide) {
//     //     fen += "Q";
//     //     added = true;
//     // }
//     // if (board.BlackCanCastleToKingSide) {
//     //     fen += "k";
//     //     added = true;
//     // }
//     // if (board.BlackCanCastleToQueenSide) {
//     //     fen += "q";
//     //     added = true;
//     // }
//     // if (!added) {
//     //     fen += "-";
//     // }

//     // fen += " - ";
//     // fen += `${0} ${board.fullmove}`;

//     // console.log(fen);
//     return replaceConsecutiveAmpersands(fen);
// }

function coordinateToIndex(coordinate) {
    return coordinates.indexOf(coordinate)
}

async function sendRequest(url) {
    const response = await fetch(url);
    let data = await response.text();
    return data;
}

// URL for Stockfish API
const stockfishUrl = "https://stockfish.online/api/s/v2.php?fen=";

// Async function to send a request to the Stockfish API
async function sendRequest(url) {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json(); // Parse JSON response
}

// Main function to choose the computer's move using Stockfish API
async function chooseComputerMove() {
    try {
        let myFen = board.fen; // Get current board position in FEN
        console.log("Current FEN:", myFen);

        // Build URL with FEN and depth (depth can be adjusted as needed)
        let url = `${stockfishUrl}${encodeURIComponent(myFen)}&depth=7`;

        // Send request to Stockfish API to get the best move
        let data = await sendRequest(url);

        // Check if the API response was successful and contains a valid best move
        if (data.success && data.bestmove) {
            const bestMoveStr = data.bestmove.split(" ")[1]; // Extract the best move (e.g., g8f6)

            // The move will be in the form g8f6, so we split it into start and target squares
            const startSquare = bestMoveStr.slice(0, 2);  // Start square (e.g., "g8")
            const targetSquare = bestMoveStr.slice(2, 4); // Target square (e.g., "f6")
            
            // Convert board coordinates (e.g., "g8", "f6") to indices
            let moveStart = coordinateToIndex(startSquare);
            let moveTarget = coordinateToIndex(targetSquare);

            move = new Move(moveStart, moveTarget)
            console.log(move)
            // Return the best move as a Move object
            return move;
        } else {
            throw new Error("API did not return a valid best move.");
        }
    } catch (error) {
        console.log(`Error getting move from Stockfish API. Falling back to random move. \nError: ${error}`);
        
        // Fallback to a random move if the engine fails
        moves = getNewMoves(); // Generate new possible moves for fallback
        const randomIndex = Math.floor(Math.random() * moves.length);
        return moves[randomIndex];
    }
}

async function playComputer() {
    let computerMove = await chooseComputerMove();
    if (!computerMove) {
        return;
    }
    let startSquare = computerMove.startSquare;
    let targetSquare = computerMove.targetSquare;
    let captured = isCapture(computerMove);

    Piece.movePiece(document.getElementById(startSquare),
        document.getElementById(targetSquare),
        board.Squares[startSquare],
        captured);

    let draggedPiece = document.getElementById(startSquare).children[0];
    changeViewAfterMove(document.getElementById(startSquare),
        document.getElementById(targetSquare),
        draggedPiece);

    if (AI_vs_AI) { // AI versus AI
        setTimeout(() => {
            playComputer();
        }, AI_playSpeed);
    }
    else {
        // if player plays
        moves = getNewMoves();
    }
}

function getNewMoves() {
    let newGeneratedMoves = generateMoves();
    newGeneratedMoves = board.filterLegalMoves(newGeneratedMoves);
    checkMate(newGeneratedMoves);
    // console.log(newGeneratedMoves);
    return newGeneratedMoves;
}

function checkMate(newGeneratedMoves) {
    if (newGeneratedMoves.length === 0) {
        if (board.ColorToMove === Piece.White) {
            if (board.WhiteKingIsChecked) {
                console.log("MATE | BLACK WON");
                setTimeout(() => {
                    alert("MATE | BLACK WON");
                }, 3000);
            } else {
                setTimeout(() => {
                    alert("DRAW");
                }, 3000);
            }
        } else {
            if (board.BlackKingIsChecked) {
                console.log("MATE | WHITE WON");
                setTimeout(() => {
                    alert("MATE | WHITE WON");
                }, 3000);
            } else {
                setTimeout(() => {
                    alert("DRAW");
                }, 3000);
            }
        }
    }
}

function checkDraw() {
}


let movesPlayed = document.getElementById("moves-played");
function updatePlayedMoves() {
    if (board.MovesPlayed.length == 1) {
        movesPlayed.innerHTML = stringEmpty;
    }
    let l = board.MovesPlayed.length;
    if (l === 0) return;
    let content;

    if (l % 2 === 0) {
        no = l / 2;
        let element = document.getElementById(`played-move-${no}`);
        let blackMoveIndex = board.MovesPlayed[l - 1].targetSquare;
        let c2 = coordinates[blackMoveIndex];
        let whiteMoveIndex = board.MovesPlayed[l - 2].targetSquare;
        let c1 = coordinates[whiteMoveIndex];
        let w_piece = board.Squares[whiteMoveIndex];
        let w_unicode;
        if (w_piece.piece != Piece.Pawn) {
            w_unicode = Piece.getUnicode(w_piece);
        } else {
            w_unicode = '';
        }
        let b_piece = board.Squares[blackMoveIndex];
        let b_unicode;
        if (b_piece.piece != Piece.Pawn) {
            b_unicode = Piece.getUnicode(b_piece);
        } else {
            b_unicode = '';
        }
        element.innerHTML = `
        <section id='played-move-${no}' class="played-move">
            <section id="no">${no}</section>
            <section id="white-move">${w_unicode}${c1}</section>
            <section id="black-move">${b_unicode}${c2}</section>
        </section>
        `;
    }
    else {
        let whiteMoveIndex = board.MovesPlayed[l - 1].targetSquare;
        let c1 = coordinates[whiteMoveIndex];
        let no = Math.floor(l / 2) + 1;
        let piece = board.Squares[whiteMoveIndex];
        let unicode;
        if (piece.piece != Piece.Pawn) {
            unicode = Piece.getUnicode(piece);
        } else {
            unicode = '';
        }
        content = `
        <section id='played-move-${no}' class="played-move">
            <section id="no">${no}</section>
            <section id="white-move">${unicode}${c1}</section>
            <section id="black-move"></section>
        </section>
        `;
        movesPlayed.innerHTML += content;
    }

    movesPlayed.scrollTo(0, movesPlayed.scrollHeight);
}

const dropdownDefaulthtml = `
<li><button class="dropdown-item text-light" id="board-themes" onclick="showBoardThemes()">Board Theme</button></li>
<li><button class="dropdown-item text-light" id="piece-sets" onclick="showPieceSets()">Piece Set</button></li>`;

let dropdown = document.getElementById("dropdown");
const boardThemesItem = document.getElementById('board-themes');
const pieceSetsItem = document.getElementById('piece-sets');

boardThemesItem.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    showBoardThemes();
});

pieceSetsItem.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    showPieceSets();
});


function showPieceSets() {
    dropdown.innerHTML = stringEmpty;

    let content = '<button id="back" class="head" type="button" onclick="back()"><i class="fa-solid fa-arrow-left-long" style="color:#5c8d24"></i> Go Back</button>';
    for (let i = 0; i < allPieceStyles.length; i++) {
        const pieceStyle = allPieceStyles[i];
        let btn =
            `<button style='width:70px; height:70px; background-color:#959595;outline: none; margin-left: 1px;' onclick="changePieceSet(${i})">
            <img class='img-fluid' src="${pieceStyle.wN}">
        </button>`
        content += btn;
    }
    dropdown.innerHTML += content;
    dropdown.style.width = "215px";
    let a = document.getElementById("back");
    a.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        back();
    });
}

function changePieceSet(i) {
    const pieceStyle = allPieceStyles[i];
    selectedPieceStyleSource = pieceStyle;
    for (let i = 0; i < 64; i++) {
        let child = board.htmlBoard.children[i];
        if (child.querySelector("img")) {
            const img = child.querySelector("img");
            let pieceImgSource = getPieceSourceByClass(img.alt);
            img.src = pieceImgSource;
        }
    }
}

function back() {
    dropdown.innerHTML = dropdownDefaulthtml;
    const a = document.getElementById('board-themes');
    const n = document.getElementById('piece-sets');

    a.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        showBoardThemes();
    });

    n.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        showPieceSets();
    });
}

function showBoardThemes() {

    dropdown.innerHTML = stringEmpty;

    let content = '<button id="back" class="head" type="button" onclick="back()"><i class="fa-solid fa-arrow-left-long" style="color:#5c8d24"></i> Go Back</button>';
    content += "<section style='display:flex; flex-direction:row; flex-wrap: wrap'>"
    for (let i = 0; i < boardColors.length; i++) {
        const colors = boardColors[i];
        let btn =
            `<button style='width:80px; height:40px; outline: none; margin-left: 1px; display:flex; flex-wrap: wrap; border:none; flex-direction:row; justify-content:center;
             margin:10px;' onclick="changeBoardTheme(${i})">
            <section style='background-color:${colors[0]}; width:40px;height:40px;'></section>
            <section style='background-color:${colors[1]}; width:40px;height:40px;'></section>
        </button>`
        content += btn;
    }
    content += "</section>"
    dropdown.innerHTML += content;
    dropdown.style.width = "205px";


    let a = document.getElementById("back");
    a.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        back();
    });
}

function changeBoardTheme(i) {
    const colors = boardColors[i];
    document.documentElement.style.setProperty('--main-board-color', colors[0]);
    document.documentElement.style.setProperty('--second-board-color', colors[1]);
}