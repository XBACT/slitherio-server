const Constants = require('./constants');

let nextFoodId = 1;

class Food {
    constructor(x, y, color, size, id = null) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        this.id = id || (nextFoodId++);
        
        if (nextFoodId > 2000000000) {
            nextFoodId = 1;
        }
    }
    
    getValue() {
        const base = Math.pow(this.size / 50, 2);
        return Math.max(1, Math.ceil(base * 5));
    }
}

class Prey {
    constructor(id, x, y, color, size) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = size;
        
       
        this.angle = Math.random() * Math.PI * 2;
        this.wantedAngle = this.angle;
        this.speed = 0.5 + Math.random() * 0.5;
        this.direction = 0;
        
       
        this.lastUpdate = Date.now();
        this.changeDirectionTime = Date.now() + Math.random() * 3000;
    }
    
    update(deltaTime) {
       
        if (Date.now() > this.changeDirectionTime) {
            this.direction = Math.floor(Math.random() * 3);
            if (this.direction !== 0) {
                this.wantedAngle = Math.random() * Math.PI * 2;
            }
            this.changeDirectionTime = Date.now() + 1000 + Math.random() * 3000;
        }
        
       
        const angularSpeed = Constants.MANU2 / 1000;
        if (this.direction === 1) {
            this.angle -= angularSpeed * deltaTime;
        } else if (this.direction === 2) {
            this.angle += angularSpeed * deltaTime;
        }
        
       
        while (this.angle < 0) this.angle += Math.PI * 2;
        while (this.angle >= Math.PI * 2) this.angle -= Math.PI * 2;
        
       
        this.x += Math.cos(this.angle) * this.speed * deltaTime * 0.1;
        this.y += Math.sin(this.angle) * this.speed * deltaTime * 0.1;
        
       
        const margin = 500;
        const worldSize = Constants.GAME_RADIUS * 2;
        if (this.x < margin || this.x > worldSize - margin) {
            this.angle = Math.PI - this.angle;
            this.x = Math.max(margin, Math.min(worldSize - margin, this.x));
        }
        if (this.y < margin || this.y > worldSize - margin) {
            this.angle = -this.angle;
            this.y = Math.max(margin, Math.min(worldSize - margin, this.y));
        }
    }
    
    getValue() {
        return Math.floor(this.size * 2);
    }
    
    isInRange(x, y, range) {
        const dx = this.x - x;
        const dy = this.y - y;
        return dx * dx + dy * dy <= range * range;
    }
}


class FoodSpawner {
    constructor(gameRadius, playRadius) {
        this.gameRadius = gameRadius;
        this.playRadius = playRadius;
    }
    
    clamp(x, y) {
        const dx = x - this.gameRadius;
        const dy = y - this.gameRadius;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > this.playRadius - 50) {
            const angle = Math.atan2(dy, dx);
            return {
                x: this.gameRadius + Math.cos(angle) * (this.playRadius - 100),
                y: this.gameRadius + Math.sin(angle) * (this.playRadius - 100)
            };
        }
        return { x, y };
    }

    spawnNaturalFood() {
        const angle = Math.random() * Math.PI * 2;
        const r = Math.sqrt(Math.random()) * this.playRadius * 0.9;
        const x = this.gameRadius + Math.cos(angle) * r;
        const y = this.gameRadius + Math.sin(angle) * r;
        
        const color = Math.floor(Math.random() * Constants.FOOD_COLORS);
        const size = Constants.MIN_NATURAL_FOOD_SIZE + 
                     Math.floor(Math.random() * (Constants.MAX_NATURAL_FOOD_SIZE - Constants.MIN_NATURAL_FOOD_SIZE));
                     
        return new Food(x, y, color, size);
    }
    
    spawnFoodNear(x, y, size, isDeathFood = false) {
        const offset = 20 + Math.random() * 50;
        const angle = Math.random() * Math.PI * 2;
        let newX = x + Math.cos(angle) * offset;
        let newY = y + Math.sin(angle) * offset;
        
        const clamped = this.clamp(newX, newY);
        const color = Math.floor(Math.random() * Constants.FOOD_COLORS);
        
        return new Food(clamped.x, clamped.y, color, size);
    }
    
    spawnDeathFood(snake) {
        const foods = [];
        
        const maxFoods = snake.sct * 2;
        
        const sc = Math.min(6, 1 + (snake.sct - 2) / 106);
        const bodyRadius = 29 * sc / 2; 
        
        const headFood = new Food(
            snake.x,
            snake.y,
            Math.floor(Math.random() * Constants.FOOD_COLORS),
            Constants.MIN_DEATH_FOOD_SIZE + Math.floor(Math.random() * 20)
        );
        foods.push(headFood);
        
        if (snake.parts.length > 0) {
            for (let i = 0; i < snake.parts.length && foods.length < maxFoods; i++) {
                const part = snake.parts[i];
                
                const foodsPerPart = Math.random() < 0.3 ? 2 : 1;
                
                for (let j = 0; j < foodsPerPart && foods.length < maxFoods; j++) {
                    const offsetAngle = Math.random() * Math.PI * 2;
                    const offsetDist = Math.random() * bodyRadius * 0.8;
                    
                    const x = part.x + Math.cos(offsetAngle) * offsetDist;
                    const y = part.y + Math.sin(offsetAngle) * offsetDist;
                    
                    const pos = this.clamp(x, y);
                    const color = Math.floor(Math.random() * Constants.FOOD_COLORS);
                    
                    const baseSize = Constants.MIN_DEATH_FOOD_SIZE; 
                    const sizeRange = Math.min(38, Math.floor(sc * 6));
                    const size = baseSize + Math.floor(Math.random() * sizeRange);
                    
                    foods.push(new Food(pos.x, pos.y, color, size));
                }
            }
        }
        
        console.log(`Death food spawned: ${foods.length} items for snake with sct=${snake.sct}`);
        return foods;
    }
    
    getRandomPosition() {
        const angle = Math.random() * Math.PI * 2;
        const radius = Math.sqrt(Math.random()) * this.playRadius * 0.85;
        
        return {
            x: this.gameRadius + Math.cos(angle) * radius,
            y: this.gameRadius + Math.sin(angle) * radius
        };
    }
    
    spawnPrey(id) {
        const pos = this.getRandomPosition();
        const color = Math.floor(Math.random() * Constants.FOOD_COLORS);
        const size = 10 + Math.floor(Math.random() * 20);
        return new Prey(id, pos.x, pos.y, color, size);
    }
}

module.exports = { Food, Prey, FoodSpawner };
