
const Constants = require('./constants');
class Snake {
    constructor(id, name, skin, x, y) {
        this.id = id;
        this.name = name || '';
        this.skin = skin || 0;
        this.customSkin = null;
        
       
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2; 
        this.wantedAngle = this.angle;             
        this.ehang = this.angle;                   
        this.speed = Constants.NSP1 / 100;         
        this.boosting = false;
        
       
        this.parts = [];
        this.sct = 10; 
        this.fam = 0.5;
        
       
        this.score = Constants.INITIAL_SCORE;
        this.kills = 0;
        
       
        this.lastMoveTime = Date.now();
        this.lastAngleUpdate = Date.now();
        
       
        this.initBody();
    }
    
    initBody() {
       
        const tailAngle = this.angle + Math.PI; 
        const spacing = 42; 
        
       
        this.parts = [];
        for (let i = 0; i < this.sct; i++) {
            const dist = (i + 1) * spacing;
            this.parts.push({
                x: this.x + Math.cos(tailAngle) * dist,
                y: this.y + Math.sin(tailAngle) * dist,
                dying: false,
                sp: 0
            });
        }
        
       
        if (this.parts.length > 0) {
            this.lastSentPtsEnd = { x: this.parts[0].x, y: this.parts[0].y };
        } else {
            this.lastSentPtsEnd = { x: this.x, y: this.y };
        }
    }
    
    getScale() {
        return Math.min(6, 1 + (this.sct - 2) / 106);
    }
    
    getScang() {
        const sc = this.getScale();
        return 0.13 + 0.87 * Math.pow((7 - sc) / 6, 2);
    }
    
    getSpang() {
        const spangdv = Constants.SPANGDV / 10; 
        const spang = this.speed / spangdv;
        return Math.min(1, spang);
    }
    
    getBaseSpeed() {
        const sc = this.getScale();
        const nsp1 = Constants.NSP1 / 100; 
        const nsp2 = Constants.NSP2 / 100; 
        return nsp1 + nsp2 * sc;
    }
    
    getBoostSpeed() {
        return Constants.NSP3 / 100; 
    }
    
   
    update(deltaTime, isPlayerControlled = false) {
       
       
        if (isPlayerControlled) {
            this.angle = this.wantedAngle;
            this.speed = this.boosting ? this.getBoostSpeed() : this.getBaseSpeed();
            return;
        }
        
       
       
        const mamu = Constants.MAMU / 1000; 
        const scang = this.getScang();
        const spang = this.getSpang();
        
       
        const vfr = deltaTime / 1000 * 16;
        
       
       
        const maxTurn = mamu * vfr * scang * spang;
        
       
        let angleDiff = this.wantedAngle - this.angle;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        
       
        if (Math.abs(angleDiff) > 0.0001) {
            if (Math.abs(angleDiff) <= maxTurn) {
                this.angle = this.wantedAngle;
            } else {
                this.angle += Math.sign(angleDiff) * maxTurn;
            }
            
           
            while (this.angle < 0) this.angle += Math.PI * 2;
            while (this.angle >= Math.PI * 2) this.angle -= Math.PI * 2;
        }
        
       
        this.speed = this.boosting ? this.getBoostSpeed() : this.getBaseSpeed();
    }
    
    move() {
        const moveDistance = Constants.MOVE_DISTANCE; 
        
        const newX = this.x + Math.cos(this.angle) * moveDistance;
        const newY = this.y + Math.sin(this.angle) * moveDistance;
        
       
       
        this.updateBodyParts();
        
       
        this.x = newX;
        this.y = newY;
        
       
        this.droppedFood = null;
        
       
       
       
        if (this.boosting && this.sct > 2) {
            this.fam -= 1.0;
            if (this.fam < 0) {
                this.fam += 1;
                if (this.sct > 2) {
                   
                    if (this.parts.length > 0) {
                        const tailPart = this.parts[this.parts.length - 1];
                        this.droppedFood = { x: tailPart.x, y: tailPart.y };
                        this.parts.pop();
                    }
                    this.sct--;
                }
            }
        }
        
        return { x: newX, y: newY };
    }
    
   
   
    updateBodyParts() {
        if (this.parts.length === 0) return;
        
       
       
        for (let i = this.parts.length - 1; i > 0; i--) {
            this.parts[i].x = this.parts[i - 1].x;
            this.parts[i].y = this.parts[i - 1].y;
        }
        
       
        this.parts[0].x = this.x;
        this.parts[0].y = this.y;
    }
    
    setWantedAngle(angleByte, isOwnSnake = false) {
       
        this.wantedAngle = (angleByte / 251) * Math.PI * 2;
    }
    
    setBoost(boosting) {
        if (this.sct > 2 || !boosting) {
            this.boosting = boosting;
        }
    }
    
   
   
    addFamFromFood(foodSize) {
       
        const famIncrease = (foodSize * foodSize * 46 * 46) / 16777216;
        this.fam += famIncrease;
        
       
        while (this.fam >= 1.0 && this.sct < Constants.MAX_SNAKE_PARTS) {
            this.fam -= 1.0;
            this.sct++;
            
           
            this.pendingGrowth = (this.pendingGrowth || 0) + 1;
        }
    }
    
    addScore(amount) {
       
        this.fam += amount * 0.01; 
        
        while (this.fam >= 1.0 && this.sct < Constants.MAX_SNAKE_PARTS) {
            this.fam -= 1.0;
            this.sct++;
            this.pendingGrowth = (this.pendingGrowth || 0) + 1;
        }
    }
    
   
    getScore() {
        const fpsls = Snake.getFpsls(this.sct);
        const fmlts = Snake.getFmlts(this.sct);
        return Math.floor(15 * (fpsls + this.fam / fmlts - 1) - 5);
    }
    
    static getFpsls(sct) {
        let sum = 0;
        for (let i = 1; i <= sct; i++) {
            sum += 1 / Snake.getFmlts(i - 1);
        }
        return sum;
    }
    
    static getFmlts(sct) {
        const mscps = Constants.MAX_SNAKE_PARTS; 
        if (sct >= mscps) return Snake.getFmlts(mscps - 1);
        return Math.pow(1 - sct / mscps, 2.25);
    }
    
    hasPendingGrowth() {
        return (this.pendingGrowth || 0) > 0;
    }
    
    consumeOnePendingGrowth() {
        if (this.pendingGrowth > 0) {
            this.pendingGrowth--;
        }
    }
    
    getHeadRadius() {
       
        return 14.5 * this.getScale();
    }
    
    getBodyRadius() {
        return 14.5 * this.getScale();
    }
    
    isPointOnBody(x, y, headRadius = 0, excludeHead = false) {
       
        const bodyRadius = this.getBodyRadius();
        const collisionDist = headRadius + bodyRadius;
        const collisionDistSq = collisionDist * collisionDist;
        
       
        const partsCount = this.parts.length;
        
       
       
        const startIdx = excludeHead ? Math.min(10, Math.floor(partsCount * 0.3)) : 0;
        
        for (let i = startIdx; i < partsCount; i++) {
            const part = this.parts[i];
            const dx = x - part.x;
            const dy = y - part.y;
            
            if (dx * dx + dy * dy < collisionDistSq) {
                return true;
            }
        }
        return false;
    }
    
    collidesWithSnake(otherSnake) {
        if (otherSnake.id === this.id) return false;
        
       
        const myHeadRadius = this.getHeadRadius() * 0.8; 
        
        return otherSnake.isPointOnBody(this.x, this.y, myHeadRadius, false);
    }
    
    hitBoundary() {
        const center = Constants.GAME_RADIUS;
        const dx = this.x - center;
        const dy = this.y - center;
        const distSq = dx * dx + dy * dy;
        return distSq >= Constants.PLAY_RADIUS * Constants.PLAY_RADIUS;
    }
    
    getDistanceFromCenter() {
        return Math.sqrt(
            Math.pow(this.x - Constants.GAME_RADIUS, 2) + 
            Math.pow(this.y - Constants.GAME_RADIUS, 2)
        );
    }
    
    calculateScore() {
        return this.getScore();
    }
    
    toSpawnData() {
        return {
            id: this.id,
            name: this.name,
            skin: this.skin,
            x: this.x,
            y: this.y,
            angle: this.angle,
            wantedAngle: this.wantedAngle,
            speed: this.speed,
            sct: this.sct,
            fam: this.fam,
            parts: this.parts.slice(),
            customSkin: this.customSkin
        };
    }
}
module.exports = Snake;
