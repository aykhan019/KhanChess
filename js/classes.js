
class Board {
    constructor() {
        this.Squares = [...Array(64)].map(() => Piece.None);
        this.htmlBoard = document.getElementById("chessBoard");
        this.ColorToMove = Piece.White;
        this.MovesPlayed = [];
        this.WhiteKingIsChecked = false;
        this.BlackKingIsChecked = false;
        this.WhiteCanCastleToKingSide = true;
        this.WhiteCanCastleToQueenSide = true;
        this.BlackCanCastleToKingSide = true;
        this.BlackCanCastleToQueenSide = true;
        this.fen = chess.fen();
    }

    // This function draws a chess board
    drawBoard() {
        let isEven = true;
        for (let r = ranks.length - 1; r >= 0; r--) {
            for (let f = 0; f < files.length; f++) {
                let myClass = 'odd square';
                if (isEven) {
                    myClass = 'even square';
                }
                board.htmlBoard.innerHTML += `
                    <section id='${r * ranks.length + f}' class='${myClass}'></section>
               `;
                isEven = !isEven;
            }
            isEven = !isEven;
        }
    }

    // This function updates "Squares" property of "Board" class
    initializePieces() {
        let fenBoard = board.fen.split(" ")[0].replace(/\//g, "");
        let index = ranks.length * files.length - ranks.length;

        for (let i = 0; i < fenBoard.length; i++) {
            const char = fenBoard[i];

            let isDigit = !isNaN(parseInt(char));
            if (isDigit) {
                let digit = parseInt(char);
                for (let k = 0; k < digit; k++) {
                    board.Squares[index] = new Piece(Piece.None, Piece.None);
                    index++;
                }
            }
            else {
                board.Squares[index] = Piece.getPiece(char);
                index++
            }

            if ((index) % ranks.length === 0) {
                index -= (ranks.length * 2);
            }
        };
    }

    // This function draws pieces by using "Squares" property of "Board" class
    drawPieces() {
        for (let x = 0; x < board.Squares.length; x++) {
            const element = board.Squares[x];
            let color = Piece.getColorByNo(element.color);
            let piece = Piece.getPieceByNo(element.piece);
            let myclass = `${color}-${piece}`;
            if (myclass != `${none}-${none}`) {
                let square = document.getElementById(x);
                let pieceImgSource = getPieceSourceByClass(myclass);
                square.innerHTML = `<img src='${pieceImgSource}' class='piece' alt='${myclass}' draggable="true">`;
            }
        }
    }

    // returns index of the squares that are around in the given index
    getAdjacentSquares(index) {
        const adjacentSquares = [];
        const row = Math.floor(index / 8);
        const col = index % 8;

        for (let i = row - 1; i <= row + 1; i++) {
            for (let j = col - 1; j <= col + 1; j++) {
                if (i >= 0 && i < 8 && j >= 0 && j < 8 && (i !== row || j !== col)) {
                    adjacentSquares.push(i * 8 + j);
                }
            }
        }

        return adjacentSquares;
    }

    // returns index of the piece in Squares Array
    getPieceIndex(piece) {
        for (let i = 0; i < BOARD_SIZE; i++) {
            const square = this.Squares[i];
            if (square.piece === piece.piece && square.color === piece.color) {
                return i;
            }
        }
        return -1;
    }

    // returns true if there is a piece on the square
    isPieceOnSquare(squareIndex) {
        return this.Squares[squareIndex].piece !== Piece.None;
    }

    getRankOfIndex(index) {
        return Math.floor(index / 8) + 1; // Row index in reverse order
    }
    
    getFileOfIndex(index) {
        return String.fromCharCode(97 + (index % 8)); // File index
    }
    

    filterLegalMoves(newGeneratedMoves) {
        let legalMoves = [];
        for (let i = 0; i < newGeneratedMoves.length; i++) {
            const moveToVerify = newGeneratedMoves[i];

            // Make Move
            let startSquarePiece = board.Squares[moveToVerify.startSquare];
            let targetSquarePiece = board.Squares[moveToVerify.targetSquare];
            board.Squares[moveToVerify.startSquare] = new Piece(Piece.None, Piece.None);
            board.Squares[moveToVerify.targetSquare] = startSquarePiece;
            //    board.Squares[moveToVerify.targetSquare].hasMoved = true;
            let myPiece = board.Squares.filter(s => s.piece == Piece.King && s.color == board.ColorToMove)[0];
            let myKingSquare;
            if (myPiece)
                myKingSquare = board.getPieceIndex(myPiece);
            else
                continue;

            // change boardColor to get opponent moves
            board.ColorToMove = Piece.reverseColor(board.ColorToMove);
            let opponentsMoves = generateMoves();
            board.ColorToMove = Piece.reverseColor(board.ColorToMove);

            // Check Move
            if (opponentsMoves.filter(response => response.targetSquare == myKingSquare).length > 0) {
                // The KING Is Under Attack!
            }
            else {
                document.getElementById(myKingSquare).style.backgroundColor = stringEmpty;
                legalMoves.push(moveToVerify);
            }

            // UnMake Move
            //   board.Squares[moveToVerify.targetSquare].hasMoved = false;
            board.Squares[moveToVerify.startSquare] = startSquarePiece;
            board.Squares[moveToVerify.targetSquare] = targetSquarePiece;
        }
        // if (moves.length != legalMoves.length) {
        //     AI_vs_AI = false;
        //     console.log("----- LEGAL MOVES -----")
        //     for (let i = 0; i < legalMoves.length; i++) {
        //         const element = legalMoves[i];
        //         console.log(element.startSquare + " " + element.targetSquare);
        //     }
        //     console.log("-----------------------")
        // }
        return legalMoves;
    }
}

class Piece {
    constructor(piece, color) {
        this.piece = piece;
        this.color = color;
        this.hasMoved = false; // for pawns and castling
    }

    static movePiece(oldSquare, newSquare, piece, isCapture = false) {

        let result = chess.move(Piece.getMoveNotation(oldSquare.id, newSquare.id, piece, isCapture));


        // Remove piece from old square and place it on new square
        console.log("Move: " + oldSquare.id + " " + newSquare.id)

        board.Squares[oldSquare.id] = new Piece(Piece.None, Piece.None);
        board.Squares[newSquare.id] = piece;
        board.Squares[newSquare.id].hasMoved = true;

        // Update board color to move
        board.ColorToMove = Piece.reverseColor(board.ColorToMove);

        // Handle castling
        if (piece.piece === Piece.King && Math.abs(oldSquare.id - newSquare.id) === 2) {
            Piece.handleCastling(oldSquare, newSquare, piece);
        }

        // Handle en passant
        if (piece.piece === Piece.Pawn) {
            if (Piece.handleEnPassant(oldSquare, newSquare, piece)) {
                isCapture = true;
            }
            Piece.handlePawnPromotion(newSquare, piece);
        }

        // Check for check
        Piece.checkForCheck();

        // Handle capture audio
        isCapture ? captureAudio.play() : moveAudio.play();

        // Update the moves played
        board.MovesPlayed.push(new Move(oldSquare.id, newSquare.id));

        // Update the FEN string
        board.fen = chess.fen();
        console.log(chess.ascii());

        // Update the board and move history
        updatePlayedMoves();
        moves = getNewMoves();
    }

    // Castling logic
    static handleCastling(oldSquare, newSquare, piece) {
        let noPiece = new Piece(Piece.None, Piece.None);
        let rook;
        let newSquareId = parseInt(newSquare.id) 

        if (piece.color === Piece.White) {
            rook = new Piece(Piece.Rook, Piece.White);
            if (newSquareId === 6) { // King Side Castle
                board.Squares[7] = noPiece;
                board.Squares[5] = rook;
                changeViewAfterMove(document.getElementById(7), document.getElementById(5), document.getElementById(7).children[0]);
            } else if (newSquareId === 2) { // Queen Side Castle
                board.Squares[0] = noPiece;
                board.Squares[3] = rook;
                changeViewAfterMove(document.getElementById(0), document.getElementById(3), document.getElementById(0).children[0]);
            }
            board.WhiteCanCastleToKingSide = false;
            board.WhiteCanCastleToQueenSide = false;
        } else {
            rook = new Piece(Piece.Rook, Piece.Black);
            if (newSquareId === 62) { // King Side Castle
                board.Squares[63] = noPiece;
                board.Squares[61] = rook;
                changeViewAfterMove(document.getElementById(63), document.getElementById(61), document.getElementById(63).children[0]);
            } else if (newSquareId === 58) { // Queen Side Castle
                board.Squares[56] = noPiece;
                board.Squares[59] = rook;
                changeViewAfterMove(document.getElementById(56), document.getElementById(59), document.getElementById(56).children[0]);
            }
            board.BlackCanCastleToKingSide = false;
            board.BlackCanCastleToQueenSide = false;
        }
    }

    // En passant logic
    static handleEnPassant(oldSquare, newSquare, piece) {
        const direction = Piece.isColor(piece, Piece.White) ? 1 : -1;
        const directionToSide1 = Piece.isColor(piece, Piece.White) ? 2 : 3;
        const directionToSide2 = Piece.isColor(piece, Piece.White) ? 3 : 2;
        const leftCaptureIndex = oldSquare.id + direction * 7;
        const rightCaptureIndex = oldSquare.id + direction * 9;

        if (leftCaptureIndex === newSquare.id || rightCaptureIndex === newSquare.id) {
            if (checkEnPassant(oldSquare.id, newSquare.id, direction, directionToSide1) || 
                checkEnPassant(oldSquare.id, newSquare.id, direction, directionToSide2)) {
                const enPassantVictimSquareID = newSquare.id - (direction * 8);
                board.Squares[enPassantVictimSquareID] = new Piece(Piece.None, Piece.None);
                changeViewAfterMove(document.getElementById(enPassantVictimSquareID), document.getElementById(oldSquare.id), document.getElementById(enPassantVictimSquareID).children[0]);
                return true;
            }
        }
        return false;
    }

    // Pawn promotion logic
    static handlePawnPromotion(newSquare, piece) {
        let rank = board.getRankOfIndex(newSquare.id);
        if (rank === 1 || rank === 8) {
            const newPiece = new Piece(Piece.Queen, piece.color);
            board.Squares[newSquare.id] = newPiece;

            let mc = piece.color === Piece.White ? "white-queen" : "black-queen";
            let newPieceImgSource = getPieceSourceByClass(mc);
            beingDragged = document.getElementById(newSquare.id).children[0];
            beingDragged.src = newPieceImgSource;
        }
    }

    // Check for check
    static checkForCheck() {
        let myKingSquareIndex = board.Squares.findIndex(f => f.piece === Piece.King && f.color === board.ColorToMove);
        let myKingSquare = document.getElementById(myKingSquareIndex);
        board.ColorToMove = Piece.reverseColor(board.ColorToMove);
        let testMoves = getNewMoves();
        board.ColorToMove = Piece.reverseColor(board.ColorToMove);

        if (testMoves.find(m => m.targetSquare === myKingSquareIndex)) {
            myKingSquare.style.backgroundImage = "radial-gradient(circle at center center, rgb(255, 0, 0) 0%, rgb(231, 0, 0) 25%, rgba(169, 0, 0) 89%, rgba(158, 0, 0) 100%)";
            myPrevKingSquare = myKingSquare;
            board.Squares[myKingSquareIndex].color === Piece.White ? board.WhiteKingIsChecked = true : board.BlackKingIsChecked = true;
        } else {
            if (myPrevKingSquare != null) {
                myPrevKingSquare.style.backgroundImage = ""; // Clear background image
            }
            board.Squares[myKingSquareIndex].color === Piece.White ? board.WhiteKingIsChecked = false : board.BlackKingIsChecked = false;
        }
    }

    static getMoveNotation(oldSquareId, newSquareId, piece, isCapture = false, isPromotion = false, promotionPiece = null) {
        oldSquareId = parseInt(oldSquareId)
        newSquareId = parseInt(newSquareId)
         
        const startSquare = Piece.coordinates[oldSquareId];
        const endSquare = Piece.coordinates[newSquareId];
        let moveNotation = "";

        // Handle castling
        if (piece.piece === Piece.King && Math.abs(oldSquareId - newSquareId) === 2) {
            if (newSquareId === 6 || newSquareId === 62) {
                // Kingside castling
                return piece.color === Piece.White ? "O-O" : "O-O";
            } else if (newSquareId === 2 || newSquareId === 58) {
                // Queenside castling
                return piece.color === Piece.White ? "O-O-O" : "O-O-O";
            }
        }

        // Handle piece letter for non-pawn pieces
        if (piece.piece !== Piece.Pawn && piece.piece !== Piece.None) {
            moveNotation = Piece.getPieceLetter(piece);
            
            // For knights, add file info if necessary
            if (piece.piece === Piece.Knight) {
                // Check if other pieces can legally move to the destination square
                if (Piece.canOtherKnightMoveTo(newSquareId, oldSquareId)) {
                    moveNotation += startSquare[0]; // Add the starting file for the knight
                }
            }
            if (piece.piece === Piece.Rook) {
                if (Piece.canOtherRookMoveTo(newSquareId, oldSquareId)) {
                    moveNotation += startSquare[0];
                }
            }
            if (piece.piece === Piece.Bishop) {
                if (Piece.canOtherBishopMoveTo(newSquareId, oldSquareId)) {
                    moveNotation += startSquare[0];
                }
            }
        }

        // Handle capture
        if (isCapture) {
            moveNotation += "x";
        }

        // Handle piece promotion
        if (isPromotion) {
            moveNotation = Piece.getPieceLetter(promotionPiece) + endSquare;
        } else if (piece.piece === Piece.Pawn && !isPromotion) {
            // For pawns, add the starting column for capture notation
            if (isCapture) {
                moveNotation = startSquare[0] + "x";
            }
        }

        // Add destination square
        if (!isPromotion || piece.piece !== Piece.Pawn) {
            moveNotation += endSquare;
        }

        // Handle special cases for pawn promotion
        if (piece.piece === Piece.Pawn && (board.getRankOfIndex(newSquareId) === 1 || board.getRankOfIndex(newSquareId) === 8)) {
            moveNotation = Piece.getPieceLetter(promotionPiece) + endSquare;
        }

        // Optionally validate move notation (uncomment if needed)
        // if (!Piece.validateMoveNotation(moveNotation)) {
        //     console.error(`Invalid move notation: ${moveNotation}`);
        //     throw new Error(`Invalid move notation: ${moveNotation}`);
        // }

        console.log("Move NOTATION: " + moveNotation);
        return moveNotation;
    }

    // && move.oldSquare != oldSquareId
    static canOtherKnightMoveTo(targetSquareId, oldSquareId) {
        // Check if any piece can legally move to the target square
        
        for (let i = 0; i < board.Squares.length; i++) {
            if (i != targetSquareId) {
                const piece = board.Squares[i];
                if (piece.piece === Piece.Knight && piece.color === board.ColorToMove) {
                    const moves = generateMovesForKnight(piece, i);
                    
                    for (const m of moves) { // Correctly iterates over each Move object
                        if (m.targetSquare.toString().trim() === targetSquareId.toString().trim()
                            && m.startSquare.toString().trim() != oldSquareId.toString().trim()) {                           
                            return true;
                        }
                    }
                }
            }
        }
    
        // Restore the original board state
        return false;
    }

    static canOtherRookMoveTo(targetSquareId, oldSquareId) {
        // Check if any piece can legally move to the target square
        
        for (let i = 0; i < board.Squares.length; i++) {
            if (i != targetSquareId) {
                const piece = board.Squares[i];
                if (piece.piece === Piece.Rook && piece.color === board.ColorToMove) {
                     const moves = generateSlidingMoves(i, piece)
                        console.log("Sliding moves: ")
                        console.log(moves)
                    
                    for (const m of moves) { // Correctly iterates over each Move object
                        if (m.targetSquare.toString().trim() === targetSquareId.toString().trim()
                            && m.startSquare.toString().trim() != oldSquareId.toString().trim()) {                           
                            return true;
                        }
                    }
                }
            }
        }
    
        // Restore the original board state
        return false;
    }

    static canOtherBishopMoveTo(targetSquareId, oldSquareId) {
        // Check if any piece can legally move to the target square
        
        for (let i = 0; i < board.Squares.length; i++) {
            if (i != targetSquareId) {
                const piece = board.Squares[i];
                if (piece.piece === Piece.Bishop && piece.color === board.ColorToMove) {
                     const moves = generateSlidingMoves(i, piece)
                        console.log("Sliding moves: ")
                        console.log(moves)
                    
                    for (const m of moves) { // Correctly iterates over each Move object
                        if (m.targetSquare.toString().trim() === targetSquareId.toString().trim()
                            && m.startSquare.toString().trim() != oldSquareId.toString().trim()) {                           
                            return true;
                        }
                    }
                }
            }
        }
    
        // Restore the original board state
        return false;
    }
    


    // Coordinates for standard chess notation
    static coordinates = {
        0: "a1", 1: "b1", 2: "c1", 3: "d1", 4: "e1", 5: "f1", 6: "g1", 7: "h1",
        8: "a2", 9: "b2", 10: "c2", 11: "d2", 12: "e2", 13: "f2", 14: "g2", 15: "h2",
        16: "a3", 17: "b3", 18: "c3", 19: "d3", 20: "e3", 21: "f3", 22: "g3", 23: "h3",
        24: "a4", 25: "b4", 26: "c4", 27: "d4", 28: "e4", 29: "f4", 30: "g4", 31: "h4",
        32: "a5", 33: "b5", 34: "c5", 35: "d5", 36: "e5", 37: "f5", 38: "g5", 39: "h5",
        40: "a6", 41: "b6", 42: "c6", 43: "d6", 44: "e6", 45: "f6", 46: "g6", 47: "h6",
        48: "a7", 49: "b7", 50: "c7", 51: "d7", 52: "e7", 53: "f7", 54: "g7", 55: "h7",
        56: "a8", 57: "b8", 58: "c8", 59: "d8", 60: "e8", 61: "f8", 62: "g8", 63: "h8"
    };

    // Validate move notation
    static validateMoveNotation(notation) {
        // Regular expression for standard algebraic notation (including castling)
        const regex = /^[KQRBN]?[a-h][1-8](x[a-h][1-8])?([KQRBN])?$|^(O-O|O-O-O)$/;
        return regex.test(notation);
    }

    static get None() { return 0; }
    static get King() { return 1; }
    static get Pawn() { return 2; }
    static get Knight() { return 3; }
    static get Bishop() { return 4; }
    static get Rook() { return 5; }
    static get Queen() { return 6; }
    static get White() { return 8; }
    static get Black() { return 16; }

    // Convert piece type to standard chess notation letter
    static getPieceLetter(piece) {
        switch (piece.piece) {
            case Piece.King: return "K";
            case Piece.Queen: return "Q";
            case Piece.Rook: return "R";
            case Piece.Bishop: return "B";
            case Piece.Knight: return "N";
            case Piece.Pawn: return ""; // Pawns have no letter
            default: return "";
        }
    }

    static getPiece(char) {
        let result = new Piece(-1, -1);
        result.color = isLower(char) ? Piece.Black : Piece.White;
        char = char.toLowerCase();
        switch (char) {
            case 'p': result.piece = Piece.Pawn; break;
            case 'n': result.piece = Piece.Knight; break;
            case 'b': result.piece = Piece.Bishop; break;
            case 'r': result.piece = Piece.Rook; break;
            case 'q': result.piece = Piece.Queen; break;
            case 'k': result.piece = Piece.King; break;
        }
        return result;
    }

    static getColorByNo(no) { return no === Piece.White ? white : no === Piece.Black ? black : none; }
    static getPieceByNo(no) {
        switch (no) {
            case Piece.Pawn: return pawn;
            case Piece.Rook: return rook;
            case Piece.Knight: return knight;
            case Piece.Bishop: return bishop;
            case Piece.Queen: return queen;
            case Piece.King: return king;
            default: return none;
        }
    }

    static isColor(piece, color) { return piece.color === color; }
    static isType(piece, otherPiece) { return piece.piece === otherPiece; }
    static isSlidingPiece(piece) { return [Piece.Queen, Piece.Rook, Piece.Bishop].includes(piece.piece); }
    static reverseColor(color) { return color === Piece.White ? Piece.Black : Piece.White; }
    static getUnicode(piece) {
        switch (piece.piece) {
            case Piece.None: return "";
            case Piece.King: return piece.color === Piece.White ? "\u2654" : "\u265A";
            case Piece.Pawn: return piece.color === Piece.White ? "\u2659" : "\u265F";
            case Piece.Knight: return piece.color === Piece.White ? "\u2658" : "\u265E";
            case Piece.Bishop: return piece.color === Piece.White ? "\u2657" : "\u265D";
            case Piece.Rook: return piece.color === Piece.White ? "\u2656" : "\u265C";
            case Piece.Queen: return piece.color === Piece.White ? "\u2655" : "\u265B";
            default: return "";
        }
    }
}


class Move {
    constructor(startSquare, targetSquare) {
        this.startSquare = startSquare;
        this.targetSquare = targetSquare;
    }
}

// Utility function to check if the move received from the API is a valid move
function isValidMove(apiMove) {
    // Generate the legal moves for the current state of the board
    const legalMoves = getNewMoves();

    // Parse the API move into its components (start square, target square)
    const startSquare = parseCoordinates(apiMove.split(" ")[1]);
    const targetSquare = parseCoordinates(apiMove.split(" ")[3]);

    // Check if the API move exists in the list of legal moves
    return legalMoves.some(move => move.startSquare === startSquare && move.targetSquare === targetSquare);
}

// Utility function to parse move from standard notation (like "e2 e4")
function parseCoordinates(move) {
    const file = move[0].charCodeAt(0) - 'a'.charCodeAt(0); // Convert letter to file index
    const rank = parseInt(move[1]) - 1; // Convert rank to 0-indexed number
    return rank * 8 + file; // Return board index
}
