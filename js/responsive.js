window.addEventListener('resize', adjustChessBoardHeight);
window.addEventListener('DOMContentLoaded', adjustChessBoardHeight);

function adjustChessBoardHeight() {
    const chessBoard = document.getElementById('chessBoard');
    const screenWidth = window.innerWidth;

    // Adjust width and height based on screen width breakpoints
    if (screenWidth <= 1287 && screenWidth > 1000) {
        // Between 1000px and 1287px
        chessBoard.style.width = '800px';
        chessBoard.style.height = '800px';
    } else if (screenWidth <= 1000 && screenWidth > 768) {
        // Between 768px and 1000px
        chessBoard.style.width = '700px';
        chessBoard.style.height = '700px';
    } else if (screenWidth <= 768 && screenWidth > 576) {
        // Between 576px and 768px
        chessBoard.style.width = '500px';
        chessBoard.style.height = '500px';
    } else if (screenWidth <= 576) {
        // Smaller than 576px (mobile phones)
        chessBoard.style.width = '400px';
        chessBoard.style.height = '400px';
    } else {
        // Larger than 1287px
        chessBoard.style.width = '750px';
        chessBoard.style.height = '750px';
    }
    
    //console.log(`Width: ${chessBoard.style.width}, Height: ${chessBoard.style.height}`);
}
