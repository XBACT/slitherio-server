const Constants = require('./constants');
const Config = require('./config');
const ANGLE_MAX = 16777215;
const ANGLE_TO_RAD = (Math.PI * 2) / ANGLE_MAX;
const RAD_TO_ANGLE = ANGLE_MAX / (Math.PI * 2);
const HALF_ANGLE_MAX = ANGLE_MAX / 2;
function wrapAngleUnits(a) {
    a = a % ANGLE_MAX;
    if (a < 0) a += ANGLE_MAX;
    return a;
}
function shortestDiffUnits(target, current) {
    let diff = target - current;
    if (diff > HALF_ANGLE_MAX) diff -= ANGLE_MAX;
    else if (diff < -HALF_ANGLE_MAX) diff += ANGLE_MAX;
    return diff;
}
function distSqPointToSegment(px, py, x1, y1, x2, y2) {
    const l2 = (x1 - x2) ** 2 + (y1 - y2) ** 2;
    if (l2 === 0) return (px - x1) ** 2 + (py - y1) ** 2;
    let t = ((px - x1) * (x2 - x1) + (py - y1) * (y2 - y1)) / l2;
    t = Math.max(0, Math.min(1, t));
    const x = x1 + t * (x2 - x1);
    const y = y1 + t * (y2 - y1);
    return (px - x) ** 2 + (py - y) ** 2;
}
class Snake {
    constructor(id, name, skin, x, y, team = 0) {
        this.id = id;
        this.name = name || '';
        this.skin = skin || 0;
        this.team = team;
        this.customSkin = null;
        
       
        this.x = x;
        this.y = y;
        this.angle = Math.random() * Math.PI * 2;
        this.wantedAngle = this.angle;
       
        this.ehang = this.angle * RAD_TO_ANGLE; 
        this.wang = this.ehang;                 
        this.speed = Config.NSP1 / 100;         
        this.boosting = false;
        
       
        this.parts = [];
       
       
       
        this.sct = Math.max(2, Config.INITIAL_SNAKE_PARTS || 2);
        this.fam = 0;
       
       
        this.pendingGrowth = 0;
        
       
        this.score = Config.INITIAL_SCORE;
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
    
   
   
   
    getVisibleSct() {
        const pg = Number.isFinite(this.pendingGrowth) ? this.pendingGrowth : 0;
        return Math.max(2, this.sct - pg);
    }
    getScale() {
        const sctVisible = this.getVisibleSct();
        const sc = 1 + (sctVisible - 2) / 106;
        if (!Number.isFinite(sc)) return 1;
        return Math.min(6, Math.max(0.1, sc));
    }
    
    getScang() {
    const sc = this.getScale();
   
   
    return 0.13 + 0.87 * Math.pow((7 - sc) / 6, 2);
    }
    
    getSpang() {
    const spangdv = Config.SPANGDV / 10;
   
    const spang = this.getCurrentSpeed() / spangdv;
    return Math.min(1, spang);
    }
   
   
   
   
    applyTurnPacket(turnValue) {
        if (!Number.isFinite(turnValue)) return;
        if (turnValue === 0) return;
        const dir = (turnValue < 128) ? -1 : 1;
        const v = (turnValue < 128) ? turnValue : (turnValue - 128);
        if (v <= 0) return;
        const mamu = Config.MAMU / 1000;
        const scang = this.getScang();
        const spang = this.getSpang();
        const deltaRad = dir * mamu * v * scang * spang;
        const deltaUnits = deltaRad * RAD_TO_ANGLE;
        this.ehang = wrapAngleUnits(this.ehang + deltaUnits);
        this.wang = this.ehang;
       
        this.angle = this.ehang * ANGLE_TO_RAD;
        this.wantedAngle = this.wang * ANGLE_TO_RAD;
    }
    
    getBaseSpeed() {
        const sc = this.getScale();
        const nsp1 = Config.NSP1 / 100; 
        const nsp2 = Config.NSP2 / 100; 
        return nsp1 + nsp2 * sc;
    }
    
    getBoostSpeed() {
        return Config.NSP3 / 100; 
    }
    
    getCurrentSpeed() {
        return this.boosting ? this.getBoostSpeed() : this.getBaseSpeed();
    }
    update(deltaTime, isPlayerControlled = false) {
       
        const mamu = Config.MAMU / 1000;
        const scang = this.getScang();
        const spang = this.getSpang();
       
        const vfr = deltaTime / 8;
       
        const maxTurnRad = mamu * vfr * scang * spang;
        const maxTurnUnits = maxTurnRad * RAD_TO_ANGLE;
        const diffUnits = shortestDiffUnits(this.wang, this.ehang);
       
        const deadzoneUnits = 0.0001 * RAD_TO_ANGLE;
        if (Math.abs(diffUnits) > deadzoneUnits) {
            if (Math.abs(diffUnits) <= maxTurnUnits) {
                this.ehang = wrapAngleUnits(this.wang);
            } else {
                this.ehang = wrapAngleUnits(this.ehang + Math.sign(diffUnits) * maxTurnUnits);
            }
        }
       
        this.angle = this.ehang * ANGLE_TO_RAD;
        this.wantedAngle = this.wang * ANGLE_TO_RAD;
        this.speed = this.boosting ? this.getBoostSpeed() : this.getBaseSpeed();
    }
   
   
    move(grow = false) {
        const moveDistance = Config.MOVE_DISTANCE; 
        
        const newX = this.x + Math.cos(this.angle) * moveDistance;
        const newY = this.y + Math.sin(this.angle) * moveDistance;
        
       
       
        this.updateBodyParts(grow);
        
       
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
    
   
   
    updateBodyParts(grow = false) {
        if (this.parts.length === 0) return;
       
       
       
        if (grow) {
            const tail = this.parts[this.parts.length - 1];
            this.parts.push({ x: tail.x, y: tail.y, dying: false, sp: 0 });
        }
       
       
        const lastIndex = this.parts.length - 1;
        const startIndex = grow ? lastIndex - 1 : lastIndex;
        for (let i = startIndex; i > 0; i--) {
            this.parts[i].x = this.parts[i - 1].x;
            this.parts[i].y = this.parts[i - 1].y;
        }
       
        this.parts[0].x = this.x;
        this.parts[0].y = this.y;
    }
    
    setWantedAngle(angleByte, isOwnSnake = false) {
       
        this.wang = (angleByte / 251) * ANGLE_MAX;
        this.wantedAngle = this.wang * ANGLE_TO_RAD;
    }
    
    setBoost(boosting) {
        if (this.sct > 2 || !boosting) {
            this.boosting = boosting;
        }
    }
    
   
   
    addFamFromFood(foodSize) {
       
        const famIncrease = (foodSize * foodSize * 46 * 46) / 16777216;
        this.fam += famIncrease;
        
       
        while (this.fam >= 1.0 && this.sct < Config.MAX_SNAKE_PARTS) {
            this.fam -= 1.0;
            this.sct++;
            
           
            this.pendingGrowth = (this.pendingGrowth || 0) + 1;
        }
    }
    
    addScore(amount) {
       
        this.fam += amount * 0.01; 
        
        while (this.fam >= 1.0 && this.sct < Config.MAX_SNAKE_PARTS) {
            this.fam -= 1.0;
            this.sct++;
            this.pendingGrowth = (this.pendingGrowth || 0) + 1;
        }
    }
    
   
    getScore() {
        const sctVisible = this.getVisibleSct();
        const fpsls = Snake.getFpsls(sctVisible);
        const fmlts = Snake.getFmlts(sctVisible);
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
        const mscps = Config.MAX_SNAKE_PARTS; 
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
       
        return 15.0 * this.getScale();
    }
    
    getBodyRadius() {
        return 15.0 * this.getScale();
    }
    
    isPointOnBody(x, y, headRadius = 0, excludeHead = false) {
        const bodyRadius = this.getBodyRadius();
        const collisionDist = headRadius + bodyRadius;
        const collisionDistSq = collisionDist * collisionDist;
       
       
       
       
        const points = [{ x: this.x, y: this.y }, ...this.parts];
        if (points.length < 2) return false;
        const partsCount = this.parts.length;
        const startIdxRaw = excludeHead ? Math.max(1, Math.min(10, Math.floor(partsCount * 0.3))) : 0;
        const startIdx = Math.min(startIdxRaw, points.length - 2);
        for (let i = startIdx; i < points.length - 1; i++) {
            const p1 = points[i];
            const p2 = points[i + 1];
           
            const minX = Math.min(p1.x, p2.x) - collisionDist;
            const maxX = Math.max(p1.x, p2.x) + collisionDist;
            const minY = Math.min(p1.y, p2.y) - collisionDist;
            const maxY = Math.max(p1.y, p2.y) + collisionDist;
            if (x < minX || x > maxX || y < minY || y > maxY) {
                continue;
            }
            const distSq = distSqPointToSegment(x, y, p1.x, p1.y, p2.x, p2.y);
            if (distSq <= collisionDistSq) {
                return true;
            }
        }
        return false;
    }
    
    collidesWithSnake(otherSnake) {
        if (otherSnake.id === this.id) return false;
       
        const myHeadRadius = this.getHeadRadius();
       
        if (otherSnake.isPointOnBody(this.x, this.y, myHeadRadius, false)) return true;
       
        const maxRecentSegments = Math.min(8, this.parts.length);
        const recentHistory = this.parts.slice(0, maxRecentSegments);
        for (const p of recentHistory) {
            if (otherSnake.isPointOnBody(p.x, p.y, myHeadRadius, false)) return true;
        }
       
       
       
       
       
        const historyPoints = [{ x: this.x, y: this.y }, ...recentHistory];
       
        const ts = [0.2, 0.4, 0.6, 0.8];
        for (let i = 0; i < historyPoints.length - 1; i++) {
            const a = historyPoints[i];
            const b = historyPoints[i + 1];
            for (const t of ts) {
                const sx = a.x + (b.x - a.x) * t;
                const sy = a.y + (b.y - a.y) * t;
                if (otherSnake.isPointOnBody(sx, sy, myHeadRadius, false)) return true;
            }
        }
        return false;
    }
    
    hitBoundary() {
        const center = Config.GAME_RADIUS;
        const dx = this.x - center;
        const dy = this.y - center;
        const distSq = dx * dx + dy * dy;
        return distSq >= Config.PLAY_RADIUS * Config.PLAY_RADIUS;
    }
    
    getDistanceFromCenter() {
        return Math.sqrt(
            Math.pow(this.x - Config.GAME_RADIUS, 2) + 
            Math.pow(this.y - Config.GAME_RADIUS, 2)
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
            ehang: this.ehang,
            wang: this.wang,
            speed: this.speed,
            sct: this.sct,
            fam: this.fam,
            parts: this.parts.slice(),
            customSkin: this.customSkin
        };
    }
}
module.exports = Snake;