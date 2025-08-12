import React, { useState, useEffect } from "react";

const winningCombinations = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

export default function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);

  const [difficulty, setDifficulty] = useState(null); // difficulty not chosen yet
  const [mistakeChance, setMistakeChance] = useState(0);

  const human = "X";
  const bot = "O";

  const checkWinner = (board) => {
    for (let [a, b, c] of winningCombinations) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return null;
  };

  const checkDraw = (board) => board.every(cell => cell !== null);

  const minimax = (newBoard, depth, isMaximizing) => {
    let result = checkWinner(newBoard);
    if (result === bot) return 10 - depth;
    if (result === human) return depth - 10;
    if (checkDraw(newBoard)) return 0;

    if (isMaximizing) {
      let bestScore = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (newBoard[i] === null) {
          newBoard[i] = bot;
          let score = minimax(newBoard, depth + 1, false);
          newBoard[i] = null;
          bestScore = Math.max(score, bestScore);
        }
      }
      return bestScore;
    } else {
      let bestScore = Infinity;
      for (let i = 0; i < 9; i++) {
        if (newBoard[i] === null) {
          newBoard[i] = human;
          let score = minimax(newBoard, depth + 1, true);
          newBoard[i] = null;
          bestScore = Math.min(score, bestScore);
        }
      }
      return bestScore;
    }
  };

  const botMove = () => {
    let bestScore = -Infinity;
    let bestMove = null;
    let possibleMoves = [];

    // Step 1: First check if player is about to win (high priority block)
    for (let [a, b, c] of winningCombinations) {
        const line = [board[a], board[b], board[c]];
        if (line.filter(v => v === human).length === 2 && line.includes(null)) {
        const blockIndex = [a, b, c][line.indexOf(null)];
        const newBoard = [...board];
        newBoard[blockIndex] = bot;
        setBoard(newBoard);
        setIsPlayerTurn(true);
        return; // immediate block, skip mistake logic
        }
    }

    // Step 2: Evaluate moves normally
    for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
        let newBoard = [...board];
        newBoard[i] = bot;
        let score = minimax(newBoard, 0, false);
        possibleMoves.push({ index: i, score });
        if (score > bestScore) {
            bestScore = score;
            bestMove = i;
        }
        }
    }

    let moveToPlay;

    // Step 3: Apply mistake logic only if no urgent block is needed
    if (Math.random() < mistakeChance) {
        const nonBestMoves = possibleMoves.filter(m => m.index !== bestMove);
        if (nonBestMoves.length > 0) {
          moveToPlay = nonBestMoves[Math.floor(Math.random() * nonBestMoves.length)].index;
        } else {
          moveToPlay = bestMove;
        }
    } else {
        moveToPlay = bestMove;
    }

    // Step 4: Play chosen move
    if (moveToPlay !== null) {
        const newBoard = [...board];
        newBoard[moveToPlay] = bot;
        setBoard(newBoard);
        setIsPlayerTurn(true);
    }
    };


  const handleClick = (index) => {
    if (!isPlayerTurn || board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = human;
    setBoard(newBoard);
    setIsPlayerTurn(false);
  };

  useEffect(() => {
    const gameWinner = checkWinner(board);
    if (gameWinner) {
      setWinner(gameWinner);
      return;
    }
    if (checkDraw(board)) {
      setIsDraw(true);
      return;
    }
    if (!isPlayerTurn) {
      const timer = setTimeout(botMove, 500);
      return () => clearTimeout(timer);
    }
  }, [board, isPlayerTurn]);

  const restartGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setWinner(null);
    setIsDraw(false);
  };

  const startGameWithDifficulty = (level) => {
    setDifficulty(level);
    if (level === "easy") setMistakeChance(0.3);  
    else if (level === "medium") setMistakeChance(0.2); 
    else if (level === "hard") setMistakeChance(0.1);   
  };

  if (!difficulty) {
    return (
      <div style={{ textAlign: "center" }}>
        <h1>Choose Difficulty</h1>
        <button onClick={() => startGameWithDifficulty("easy")}>Easy</button>
        <button onClick={() => startGameWithDifficulty("medium")}>Medium</button>
        <button onClick={() => startGameWithDifficulty("hard")}>Hard</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Tic Tac Toe ({difficulty.toUpperCase()} Mode)</h1>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 100px)",
        gap: "5px", justifyContent: "center", marginBottom: "20px"
      }}>
        {board.map((cell, idx) => (
          <button
            key={idx}
            onClick={() => handleClick(idx)}
            style={{
              width: "100px", height: "100px", fontSize: "2rem",
              cursor: cell || winner ? "default" : "pointer",
              backgroundColor: "#eee"
            }}
            disabled={!!cell || !!winner}
          >
            {cell}
          </button>
        ))}
      </div>
      {winner && <h2>{winner} wins!</h2>}
      {!winner && isDraw && <h2>It's a draw!</h2>}
      {(winner || isDraw) && (
        <div>
          <button onClick={restartGame}>Restart</button>
          <button onClick={() => setDifficulty(null)}>Change Difficulty</button>
        </div>
      )}
    </div>
  );
}
