var files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
var ranks = ['1', '2', '3', '4', '5', '6', '7', '8'];
const BOARD_SIZE = files.length * ranks.length;

const white = "white";
const black = "black";

const pawn = "pawn";
const rook = "rook";
const knight = "knight";
const bishop = "bishop";
const queen = "queen";
const king = "king";
const none = "none";
const stringEmpty = "";

const numSquaresToEdge = [];
const directionOffsets = [8, -8, -1, 1, 7, -7, 9, -9];
const directionsForKnight = [-17, -15, -10, -6, 6, 10, 15, 17];

let selectedPieceStyleSource = allPieceStyles[18];

let moveAudio = new Audio("Assets/Sounds/Move.mp3");
let captureAudio = new Audio("Assets/Sounds/Capture.mp3");

let white_castleKS = false;
let black_castleKS = false;

let AI_vs_AI = false;
let player_vs_AI = true;

let AI_playSpeed = 50;

let beingDragged;
let oldSquare;

let myPrevKingSquare = null;

let oldSquareSelected = false;

let previousSquareIdForPossibleMoves = -1;

const engine_url_bestMove = "https://www.chessdb.cn/cdb.php?action=querybest&board=";
const engine_url_moveSearch = "https://www.chessdb.cn/cdb.php?action=querysearch&board=";

const chess = new Chess();
    
let coordinates = [
    "a1",
    "b1",
    "c1",
    "d1",
    "e1",
    "f1",
    "g1",
    "h1",
    "a2",
    "b2",
    "c2",
    "d2",
    "e2",
    "f2",
    "g2",
    "h2",
    "a3",
    "b3",
    "c3",
    "d3",
    "e3",
    "f3",
    "g3",
    "h3",
    "a4",
    "b4",
    "c4",
    "d4",
    "e4",
    "f4",
    "g4",
    "h4",
    "a5",
    "b5",
    "c5",
    "d5",
    "e5",
    "f5",
    "g5",
    "h5",
    "a6",
    "b6",
    "c6",
    "d6",
    "e6",
    "f6",
    "g6",
    "h6",
    "a7",
    "b7",
    "c7",
    "d7",
    "e7",
    "f7",
    "g7",
    "h7",
    "a8",
    "b8",
    "c8",
    "d8",
    "e8",
    "f8",
    "g8",
    "h8",
];

const boardColors = [
    ["#DEE3E6", "#8CA2AD"],
    ["#C2CCD6", "#4678AB"],
    ["#CCCFE0", "#71809D"],
    ["#9C8154", "#745C2E"],
    ["#BE9B64", "#855932"],
    ["#D7B88C", "#BB8C72"],
    ["#C9C9C1", "#C08D0E"],
    ["#819983", "#60765F"],
    ["#ABABAB", "#878787"],
    ["#ADA694", "#867D6A"],
    ["#9F90B0", "#7D4A8D"],
    ["#F0F1C6", "#F27474"],
    ["#FBEBD1", "#8C6441"],
    ["#829AAE", "#60768b"],
    ["#CDC9C4", "#90919B"],
    ["#D7A35A", "#9B5925"],
    ["#BCAF9F", "#8F693C"],
    ["#E0BF94", "#B26E39"],
    ["#F0D9B5", "#B58863"],
    ["#FFFFDD", "#86A666"],
    ["#F1F6B3", "#58945D"],
    ["#AFAFAF", "#737373"],
    ["#DCDCDC", "#C8C8C8"],
    ["#E1D6EB", "#9A7EB6"],
    ["#ECECEC", "#C1C18E"],
    ["#204593", "#492350"]
  ];

// https://www.chessdb.cn/cdb.php?action=querybest&board=rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR%20w%20KQkq%20-%200%201&json=1