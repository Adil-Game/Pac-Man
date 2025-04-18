class Ghost {
    constructor(x, y, index) {
        this.x = x;
        this.y = y;
        this.index = index;
        this.direction = 0;
        this.speed = 1.5;
        this.scared = false;
        this.scaredTimer = 0;
        this.dead = false;
        this.inBox = true;
        this.exitDelay = index * 100; // Stagger ghost exits
        this.exitTimer = this.exitDelay;
    }

    update(pacmanX, pacmanY) {
        if (this.scaredTimer > 0) {
            this.scaredTimer--;
            if (this.scaredTimer === 0) {
                this.scared = false;
            }
        }

        // Handle ghost house exit
        if (this.inBox) {
            if (this.exitTimer > 0) {
                this.exitTimer--;
                return;
            }
            
            // Move up to exit the box
            if (this.y > 11 * CELL_SIZE) {
                this.y -= this.speed;
            } else {
                this.inBox = false;
                this.direction = 0; // Start moving right
            }
            return;
        }

        // Ghost AI
        if (!this.dead) {
            const possibleDirections = this.getPossibleDirections();
            if (possibleDirections.length > 0) {
                if (this.scared) {
                    // When scared, move randomly but avoid reversing direction if possible
                    const oppositeDir = (this.direction + 2) % 4;
                    const safeDirections = possibleDirections.filter(dir => dir !== oppositeDir);
                    this.direction = safeDirections.length > 0 ? 
                        safeDirections[Math.floor(Math.random() * safeDirections.length)] :
                        possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
                } else {
                    // Improved chase behavior
                    let bestDirection = this.direction;
                    let shortestDistance = Infinity;
                    
                    possibleDirections.forEach(dir => {
                        let testX = this.x;
                        let testY = this.y;
                        
                        switch (dir) {
                            case 0: testX += CELL_SIZE; break;
                            case 1: testY += CELL_SIZE; break;
                            case 2: testX -= CELL_SIZE; break;
                            case 3: testY -= CELL_SIZE; break;
                        }
                        
                        // Add slight randomness to make movement less predictable
                        const randomOffset = Math.random() * 50 - 25;
                        const distance = Math.hypot(testX - pacmanX, testY - pacmanY) + randomOffset;
                        
                        // Avoid sudden direction reversals
                        const oppositeDir = (this.direction + 2) % 4;
                        const directionPenalty = dir === oppositeDir ? 100 : 0;
                        
                        if (distance + directionPenalty < shortestDistance) {
                            shortestDistance = distance + directionPenalty;
                            bestDirection = dir;
                        }
                    });
                    
                    this.direction = bestDirection;
                }
            }
        }

        // Move ghost
        switch (this.direction) {
            case 0: this.x += this.speed; break;
            case 1: this.y += this.speed; break;
            case 2: this.x -= this.speed; break;
            case 3: this.y -= this.speed; break;
        }

        // Wrap around the tunnel
        if (this.x < 0) this.x = 448 - CELL_SIZE;
        if (this.x >= 448) this.x = 0;
    }

    getPossibleDirections() {
        const directions = [];
        for (let dir = 0; dir < 4; dir++) {
            if (this.canMove(dir)) {
                directions.push(dir);
            }
        }
        return directions;
    }

    canMove(dir) {
        let nextX = this.x;
        let nextY = this.y;
        
        switch (dir) {
            case 0: nextX += this.speed; break;
            case 1: nextY += this.speed; break;
            case 2: nextX -= this.speed; break;
            case 3: nextY -= this.speed; break;
        }

        const gridX = Math.floor(nextX / CELL_SIZE);
        const gridY = Math.floor(nextY / CELL_SIZE);

        if (gridY < 0 || gridY >= LEVEL_MAP.length || 
            gridX < 0 || gridX >= LEVEL_MAP[0].length) {
            return true;
        }

        return LEVEL_MAP[gridY][gridX] !== 1;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + CELL_SIZE / 2, this.y + CELL_SIZE / 2);

        // Draw ghost body
        ctx.beginPath();
        ctx.arc(0, -2, CELL_SIZE / 2, Math.PI, 0, false);
        ctx.lineTo(CELL_SIZE / 2, CELL_SIZE / 2 - 2);
        
        // Draw wavy bottom
        for (let i = 0; i < 3; i++) {
            ctx.quadraticCurveTo(
                CELL_SIZE / 3 * (2 - i), CELL_SIZE / 4 - 2,
                CELL_SIZE / 3 * (1 - i), CELL_SIZE / 2 - 2
            );
        }
        
        ctx.lineTo(-CELL_SIZE / 2, CELL_SIZE / 2 - 2);
        
        if (this.scared) {
            ctx.fillStyle = this.scaredTimer < 100 && this.scaredTimer % 20 < 10 ? '#ffffff' : '#2121ff';
        } else {
            ctx.fillStyle = GHOST_COLORS[this.index];
        }
        ctx.fill();

        // Draw eyes
        const eyeX = [-5, 5];
        eyeX.forEach(x => {
            ctx.beginPath();
            ctx.arc(x, -5, 2, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.fill();
            
            // Pupils
            ctx.beginPath();
            ctx.arc(x + Math.cos(this.direction * Math.PI / 2),
                   -5 + Math.sin(this.direction * Math.PI / 2),
                   1, 0, Math.PI * 2);
            ctx.fillStyle = '#000000';
            ctx.fill();
        });

        ctx.restore();
    }
} 