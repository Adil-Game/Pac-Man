class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.levelData = JSON.parse(JSON.stringify(LEVEL_MAP));
        
        // Initialize Pac-Man at starting position
        this.pacman = new Pacman(14 * CELL_SIZE, 23 * CELL_SIZE);
        
        // Initialize ghosts
        this.ghosts = [
            new Ghost(13 * CELL_SIZE, 11 * CELL_SIZE, 0),
            new Ghost(14 * CELL_SIZE, 11 * CELL_SIZE, 1),
            new Ghost(13 * CELL_SIZE, 12 * CELL_SIZE, 2),
            new Ghost(14 * CELL_SIZE, 12 * CELL_SIZE, 3)
        ];

        // Set up keyboard controls
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight': this.pacman.nextDirection = 0; break;
                case 'ArrowDown': this.pacman.nextDirection = 1; break;
                case 'ArrowLeft': this.pacman.nextDirection = 2; break;
                case 'ArrowUp': this.pacman.nextDirection = 3; break;
            }
        });

        this.gameLoop();
    }

    checkCollisions() {
        const pacmanGridX = Math.floor(this.pacman.x / CELL_SIZE);
        const pacmanGridY = Math.floor(this.pacman.y / CELL_SIZE);

        // Check for dot collection
        if (this.levelData[pacmanGridY][pacmanGridX] === 2) {
            this.levelData[pacmanGridY][pacmanGridX] = 0;
            this.score += 10;
        }
        // Check for power dot collection
        else if (this.levelData[pacmanGridY][pacmanGridX] === 3) {
            this.levelData[pacmanGridY][pacmanGridX] = 0;
            this.score += 50;
            this.ghosts.forEach(ghost => {
                ghost.scared = true;
                ghost.scaredTimer = 300;
            });
        }

        // Check ghost collisions
        this.ghosts.forEach(ghost => {
            const distance = Math.hypot(
                this.pacman.x - ghost.x,
                this.pacman.y - ghost.y
            );

            if (distance < CELL_SIZE) {
                if (ghost.scared) {
                    ghost.dead = true;
                    this.score += 200;
                } else if (!ghost.dead) {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver = true;
                    } else {
                        this.resetPositions();
                    }
                }
            }
        });
    }

    resetPositions() {
        this.pacman.x = 14 * CELL_SIZE;
        this.pacman.y = 23 * CELL_SIZE;
        this.pacman.direction = 0;
        this.pacman.nextDirection = 0;

        this.ghosts.forEach((ghost, index) => {
            ghost.x = (13 + (index % 2)) * CELL_SIZE;
            ghost.y = (11 + Math.floor(index / 2)) * CELL_SIZE;
            ghost.direction = 0;
            ghost.scared = false;
            ghost.dead = false;
        });
    }

    checkWin() {
        for (let row of this.levelData) {
            if (row.includes(2) || row.includes(3)) {
                return false;
            }
        }
        return true;
    }

    drawScore() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 20);
        this.ctx.fillText(`Lives: ${this.lives}`, 10, 40);
    }

    drawMaze() {
        for (let y = 0; y < this.levelData.length; y++) {
            for (let x = 0; x < this.levelData[y].length; x++) {
                const cell = this.levelData[y][x];
                if (cell === 1) {
                    // Draw wall
                    this.ctx.fillStyle = WALL_COLOR;
                    this.ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
                } else if (cell === 2) {
                    // Draw dot
                    this.ctx.beginPath();
                    this.ctx.arc(x * CELL_SIZE + CELL_SIZE / 2,
                               y * CELL_SIZE + CELL_SIZE / 2,
                               2, 0, Math.PI * 2);
                    this.ctx.fillStyle = DOT_COLOR;
                    this.ctx.fill();
                } else if (cell === 3) {
                    // Draw power dot
                    this.ctx.beginPath();
                    this.ctx.arc(x * CELL_SIZE + CELL_SIZE / 2,
                               y * CELL_SIZE + CELL_SIZE / 2,
                               6, 0, Math.PI * 2);
                    this.ctx.fillStyle = POWER_DOT_COLOR;
                    this.ctx.fill();
                }
            }
        }
    }

    gameLoop() {
        // Clear the canvas
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.gameOver) {
            // Update game objects
            this.pacman.update();
            this.ghosts.forEach(ghost => ghost.update(this.pacman.x, this.pacman.y));
            this.checkCollisions();

            // Draw game objects
            this.drawMaze();
            this.pacman.draw(this.ctx);
            this.ghosts.forEach(ghost => ghost.draw(this.ctx));
            this.drawScore();

            // Check win condition
            if (this.checkWin()) {
                this.gameOver = true;
            }
        } else {
            // Draw game over screen
            this.ctx.fillStyle = '#ffffff';
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            const message = this.checkWin() ? 'YOU WIN!' : 'GAME OVER';
            this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
            this.ctx.fillText('Press F5 to play again', this.canvas.width / 2, this.canvas.height / 2 + 80);
        }

        requestAnimationFrame(() => this.gameLoop());
    }
}

// Start the game when the page loads
window.onload = () => {
    new Game();
}; 