class Pacman {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.direction = 0; // 0: right, 1: down, 2: left, 3: up
        this.nextDirection = 0;
        this.speed = 2;
        this.mouthOpen = 0;
        this.mouthSpeed = 0.15;
        this.alive = true;
    }

    update() {
        // Update mouth animation
        this.mouthOpen += this.mouthSpeed;
        if (this.mouthOpen >= 1 || this.mouthOpen <= 0) {
            this.mouthSpeed = -this.mouthSpeed;
        }

        // Try to change direction if requested
        if (this.canMove(this.nextDirection)) {
            this.direction = this.nextDirection;
        }

        // Move if possible
        if (this.canMove(this.direction)) {
            switch (this.direction) {
                case 0: this.x += this.speed; break;
                case 1: this.y += this.speed; break;
                case 2: this.x -= this.speed; break;
                case 3: this.y -= this.speed; break;
            }
        }

        // Wrap around the tunnel
        if (this.x < 0) this.x = 448 - CELL_SIZE;
        if (this.x >= 448) this.x = 0;
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

        // Convert to grid coordinates
        const gridX = Math.floor(nextX / CELL_SIZE);
        const gridY = Math.floor(nextY / CELL_SIZE);

        // Check if the next position is within bounds and not a wall
        if (gridY < 0 || gridY >= LEVEL_MAP.length || 
            gridX < 0 || gridX >= LEVEL_MAP[0].length) {
            return true; // Allow movement in tunnel
        }

        return LEVEL_MAP[gridY][gridX] !== 1;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x + CELL_SIZE / 2, this.y + CELL_SIZE / 2);
        ctx.rotate((this.direction * 90) * Math.PI / 180);

        // Draw Pac-Man body
        ctx.beginPath();
        ctx.arc(0, 0, CELL_SIZE / 2, 
            (0.25 + this.mouthOpen * 0.5) * Math.PI, 
            (1.75 - this.mouthOpen * 0.5) * Math.PI);
        ctx.lineTo(0, 0);
        ctx.fillStyle = PACMAN_COLOR;
        ctx.fill();
        ctx.closePath();

        ctx.restore();
    }
} 