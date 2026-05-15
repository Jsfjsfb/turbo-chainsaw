class PongGame {
    constructor() {
        // Game constants
        this.BOARD_WIDTH = 800;
        this.BOARD_HEIGHT = 500;
        this.PADDLE_HEIGHT = 80;
        this.PADDLE_WIDTH = 12;
        this.BALL_SIZE = 15;
        this.PADDLE_SPEED = 6;
        this.MAX_BALL_SPEED = 7;
        this.WIN_SCORE = 5;

        // Game elements
        this.gameBoard = document.getElementById('gameBoard');
        this.ballElement = document.getElementById('ball');
        this.paddleLeftElement = document.getElementById('paddleLeft');
        this.paddleRightElement = document.getElementById('paddleRight');
        this.playerScoreElement = document.getElementById('playerScore');
        this.computerScoreElement = document.getElementById('computerScore');
        this.statusElement = document.getElementById('status');
        this.startBtn = document.getElementById('startBtn');
        this.resetBtn = document.getElementById('resetBtn');

        // Game state
        this.gameActive = false;
        this.playerScore = 0;
        this.computerScore = 0;

        // Ball state
        this.ball = {
            x: this.BOARD_WIDTH / 2,
            y: this.BOARD_HEIGHT / 2,
            vx: 0,
            vy: 0
        };

        // Paddle state
        this.paddleLeft = {
            y: (this.BOARD_HEIGHT - this.PADDLE_HEIGHT) / 2
        };

        this.paddleRight = {
            y: (this.BOARD_HEIGHT - this.PADDLE_HEIGHT) / 2
        };

        // Input handling
        this.keysPressed = {};
        this.mouseY = this.paddleLeft.y;

        // Game loop
        this.gameLoopId = null;

        this.init();
    }

    init() {
        // Event listeners
        this.startBtn.addEventListener('click', () => this.startGame());
        this.resetBtn.addEventListener('click', () => this.resetGame());

        document.addEventListener('keydown', (e) => {
            this.keysPressed[e.key.toLowerCase()] = true;
        });

        document.addEventListener('keyup', (e) => {
            this.keysPressed[e.key.toLowerCase()] = false;
        });

        this.gameBoard.addEventListener('mousemove', (e) => {
            const rect = this.gameBoard.getBoundingClientRect();
            this.mouseY = e.clientY - rect.top - this.PADDLE_HEIGHT / 2;
            this.mouseY = Math.max(0, Math.min(this.mouseY, this.BOARD_HEIGHT - this.PADDLE_HEIGHT));
        });

        this.resetPositions();
        this.updateDisplay();
    }

    startGame() {
        if (this.gameActive) return;

        this.gameActive = true;
        this.statusElement.textContent = '🎮 Game Started!';
        this.startBtn.textContent = 'Game Running...';
        this.startBtn.disabled = true;

        this.resetBallPosition();
        this.gameLoopId = setInterval(() => this.update(), 1000 / 60); // 60 FPS
    }

    resetGame() {
        this.gameActive = false;
        this.playerScore = 0;
        this.computerScore = 0;
        this.statusElement.textContent = '';
        this.startBtn.textContent = 'Start Game';
        this.startBtn.disabled = false;

        if (this.gameLoopId) {
            clearInterval(this.gameLoopId);
            this.gameLoopId = null;
        }

        this.resetPositions();
        this.updateDisplay();
    }

    resetPositions() {
        this.paddleLeft.y = (this.BOARD_HEIGHT - this.PADDLE_HEIGHT) / 2;
        this.paddleRight.y = (this.BOARD_HEIGHT - this.PADDLE_HEIGHT) / 2;
        this.resetBallPosition();
    }

    resetBallPosition() {
        this.ball.x = this.BOARD_WIDTH / 2;
        this.ball.y = this.BOARD_HEIGHT / 2;

        const angle = (Math.random() - 0.5) * Math.PI / 3; // -30 to 30 degrees
        const speed = 4;
        const direction = Math.random() > 0.5 ? 1 : -1;

        this.ball.vx = direction * speed * Math.cos(angle);
        this.ball.vy = speed * Math.sin(angle);
    }

    update() {
        if (!this.gameActive) return;

        // Update paddle positions
        this.updatePlayerPaddle();
        this.updateComputerPaddle();

        // Update ball position
        this.ball.x += this.ball.vx;
        this.ball.y += this.ball.vy;

        // Ball collision with top and bottom walls
        if (this.ball.y <= 0 || this.ball.y + this.BALL_SIZE >= this.BOARD_HEIGHT) {
            this.ball.vy = -this.ball.vy;
            this.ball.y = Math.max(0, Math.min(this.ball.y, this.BOARD_HEIGHT - this.BALL_SIZE));
        }

        // Ball collision with paddles
        this.checkPaddleCollision();

        // Ball out of bounds (scoring)
        if (this.ball.x < 0) {
            this.computerScore++;
            this.checkWinCondition();
            this.resetBallPosition();
        } else if (this.ball.x > this.BOARD_WIDTH) {
            this.playerScore++;
            this.checkWinCondition();
            this.resetBallPosition();
        }

        this.updateDisplay();
    }

    updatePlayerPaddle() {
        // Arrow keys control
        if (this.keysPressed['arrowup']) {
            this.paddleLeft.y -= this.PADDLE_SPEED;
        }
        if (this.keysPressed['arrowdown']) {
            this.paddleLeft.y += this.PADDLE_SPEED;
        }

        // Mouse control
        this.paddleLeft.y = this.mouseY;

        // Constrain paddle to board
        this.paddleLeft.y = Math.max(0, Math.min(this.paddleLeft.y, this.BOARD_HEIGHT - this.PADDLE_HEIGHT));
    }

    updateComputerPaddle() {
        const paddleCenter = this.paddleRight.y + this.PADDLE_HEIGHT / 2;
        const ballCenter = this.ball.y + this.BALL_SIZE / 2;
        const difficulty = 4; // Computer paddle speed

        if (paddleCenter < ballCenter - 20) {
            this.paddleRight.y += difficulty;
        } else if (paddleCenter > ballCenter + 20) {
            this.paddleRight.y -= difficulty;
        }

        // Constrain paddle to board
        this.paddleRight.y = Math.max(0, Math.min(this.paddleRight.y, this.BOARD_HEIGHT - this.PADDLE_HEIGHT));
    }

    checkPaddleCollision() {
        // Left paddle collision
        if (
            this.ball.x - this.BALL_SIZE / 2 <= 20 + this.PADDLE_WIDTH &&
            this.ball.x + this.BALL_SIZE / 2 >= 20 &&
            this.ball.y + this.BALL_SIZE >= this.paddleLeft.y &&
            this.ball.y <= this.paddleLeft.y + this.PADDLE_HEIGHT &&
            this.ball.vx < 0
        ) {
            this.ball.vx = -this.ball.vx;
            this.ball.x = 20 + this.PADDLE_WIDTH + this.BALL_SIZE / 2;

            // Add spin based on where ball hits paddle
            const paddleCenter = this.paddleLeft.y + this.PADDLE_HEIGHT / 2;
            const hitPos = (this.ball.y + this.BALL_SIZE / 2 - paddleCenter) / (this.PADDLE_HEIGHT / 2);
            this.ball.vy += hitPos * 3;

            // Cap ball speed
            const speed = Math.sqrt(this.ball.vx ** 2 + this.ball.vy ** 2);
            if (speed > this.MAX_BALL_SPEED) {
                this.ball.vx = (this.ball.vx / speed) * this.MAX_BALL_SPEED;
                this.ball.vy = (this.ball.vy / speed) * this.MAX_BALL_SPEED;
            }
        }

        // Right paddle collision
        if (
            this.ball.x + this.BALL_SIZE / 2 >= this.BOARD_WIDTH - 20 - this.PADDLE_WIDTH &&
            this.ball.x - this.BALL_SIZE / 2 <= this.BOARD_WIDTH - 20 &&
            this.ball.y + this.BALL_SIZE >= this.paddleRight.y &&
            this.ball.y <= this.paddleRight.y + this.PADDLE_HEIGHT &&
            this.ball.vx > 0
        ) {
            this.ball.vx = -this.ball.vx;
            this.ball.x = this.BOARD_WIDTH - 20 - this.PADDLE_WIDTH - this.BALL_SIZE / 2;

            // Add spin based on where ball hits paddle
            const paddleCenter = this.paddleRight.y + this.PADDLE_HEIGHT / 2;
            const hitPos = (this.ball.y + this.BALL_SIZE / 2 - paddleCenter) / (this.PADDLE_HEIGHT / 2);
            this.ball.vy += hitPos * 3;

            // Cap ball speed
            const speed = Math.sqrt(this.ball.vx ** 2 + this.ball.vy ** 2);
            if (speed > this.MAX_BALL_SPEED) {
                this.ball.vx = (this.ball.vx / speed) * this.MAX_BALL_SPEED;
                this.ball.vy = (this.ball.vy / speed) * this.MAX_BALL_SPEED;
            }
        }
    }

    checkWinCondition() {
        if (this.playerScore >= this.WIN_SCORE) {
            this.statusElement.textContent = '🎉 You Win! Congratulations! 🎉';
            this.gameActive = false;
            this.startBtn.textContent = 'Start Game';
            this.startBtn.disabled = false;
            clearInterval(this.gameLoopId);
        } else if (this.computerScore >= this.WIN_SCORE) {
            this.statusElement.textContent = '🤖 Computer Wins! Play again? 🤖';
            this.gameActive = false;
            this.startBtn.textContent = 'Start Game';
            this.startBtn.disabled = false;
            clearInterval(this.gameLoopId);
        }
    }

    updateDisplay() {
        // Update scores
        this.playerScoreElement.textContent = this.playerScore;
        this.computerScoreElement.textContent = this.computerScore;

        // Update ball position
        this.ballElement.style.left = (this.ball.x - this.BALL_SIZE / 2) + 'px';
        this.ballElement.style.top = (this.ball.y - this.BALL_SIZE / 2) + 'px';

        // Update paddle positions
        this.paddleLeftElement.style.top = this.paddleLeft.y + 'px';
        this.paddleRightElement.style.top = this.paddleRight.y + 'px';
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    new PongGame();
});
