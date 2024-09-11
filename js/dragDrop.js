let selectedPiece = null;

function addEventListenerToPiece(piece) {
    piece.addEventListener("click", function () {
        // let newSquareId = piece.parentNode.id;
        // clearPossibleMoves();

        // if (previousSquareIdForPossibleMoves != newSquareId) {
        //     if (previousSquareIdForPossibleMoves >= 0)
        //         document.getElementById(previousSquareIdForPossibleMoves).style.backgroundColor = stringEmpty;
        //     previousSquareIdForPossibleMoves = newSquareId;
        //     piece.parentNode.style.backgroundColor = "rgb(66,127, 116)";
        //     showPossibleMoves(newSquareId);

        // }
        // else {
        //     if (previousSquareIdForPossibleMoves >= 0)
        //         document.getElementById(previousSquareIdForPossibleMoves).style.backgroundColor = stringEmpty;
        //     previousSquareIdForPossibleMoves = -1;
        // }
    });
    piece.addEventListener("drag", function (e) {
        try {
            dragStart(e);
        } catch (error) {
            console.log("Error " + error);
        }
    });
    piece.addEventListener("dragend", clearPossibleMoves);

    piece.addEventListener("dragstart", function (event) {
        // Change cursor while dragging
        document.body.style.cursor = "pointer";
    });

    piece.addEventListener("dragend", function (event) {
        // Reset cursor after dragging
        document.body.style.cursor = "default";
    });
}


function addDragAndDropToPiece() {
    let squares = document.querySelectorAll(".square");

    let pieces =
        document.querySelectorAll(".piece");

    pieces.forEach(piece => {
        addEventListenerToPiece(piece);
    })

    squares.forEach(square => {
        square.addEventListener("dragover", dragOver);
        square.addEventListener("drop", function (e) {
            try {
                dragDrop(e);
            } catch (error) {
                console.log("Error " + error);
            }
        });
    });
}

// #427F74

let oldSquarePrevColor;
let draggedPiece;

function dragStart(e) {
    if (e.target.classList.contains("piece")) {
        oldSquare = e.target.parentNode;
        if (previousSquareIdForPossibleMoves >= 0)
            document.getElementById(previousSquareIdForPossibleMoves).style.backgroundColor = stringEmpty;
        clearPossibleMoves();
        oldSquare.style.backgroundColor = "rgb(66,127, 116)";
        draggedPiece = board.Squares[oldSquare.id];
        beingDragged = e.target;
        showPossibleMoves(oldSquare.id);
    }
}

function dragOver(e) {
    e.preventDefault();
}

function dragDrop(e) {
    oldSquare.style.backgroundColor = stringEmpty;
    if (board.ColorToMove !== draggedPiece.color) return; // added for 2 player (add premove)

    let element = e.target;

    let draggedPiecesMoves = moves.filter(move => move.startSquare === parseInt(oldSquare.id));

    // Change Square Array
    if (element.classList.contains("piece")) { // it is capturing a piece
        if (oldSquare.id === element.parentNode.id) return; // dropping to the same square is not considered a new move
        let found = draggedPiecesMoves.find(move => move.targetSquare === parseInt(element.parentNode.id));
        if (!found) return;
        Piece.movePiece(oldSquare, element.parentNode, draggedPiece, true); // element is a piece
    }
    else { // it is moving a piece
        let found = draggedPiecesMoves.find(move => move.targetSquare === parseInt(element.id));
        if (!found) return;
        Piece.movePiece(oldSquare, element, draggedPiece); // element is a square
    }
    changeViewAfterMove(oldSquare, element, beingDragged);
    clearPossibleMoves();

    // if player plays
    if (AI_vs_AI || player_vs_AI) {
        playComputer();
    }
    else {
        moves = getNewMoves();
    }
}


