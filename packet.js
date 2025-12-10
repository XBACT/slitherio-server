class PacketBuilder {
    constructor(initialSize = 64) {
        this.buffer = Buffer.alloc(initialSize);
        this.offset = 0;
    }
    
    ensureCapacity(needed) {
        if (this.offset + needed > this.buffer.length) {
            const newBuffer = Buffer.alloc(Math.max(this.buffer.length * 2, this.offset + needed));
            this.buffer.copy(newBuffer);
            this.buffer = newBuffer;
        }
    }
    
    writeUInt8(value) {
        this.ensureCapacity(1);
        this.buffer.writeUInt8(value & 0xFF, this.offset);
        this.offset += 1;
        return this;
    }
    
    writeInt8(value) {
        this.ensureCapacity(1);
        this.buffer.writeInt8(value, this.offset);
        this.offset += 1;
        return this;
    }
    
    writeUInt16(value) {
        this.ensureCapacity(2);
        this.buffer.writeUInt16BE(value & 0xFFFF, this.offset);
        this.offset += 2;
        return this;
    }
    
    writeUInt24(value) {
        this.ensureCapacity(3);
        this.buffer.writeUInt8((value >> 16) & 0xFF, this.offset);
        this.buffer.writeUInt16BE(value & 0xFFFF, this.offset + 1);
        this.offset += 3;
        return this;
    }
    
    writeString(str) {
        const bytes = Buffer.from(str, 'utf8');
        this.ensureCapacity(bytes.length);
        bytes.copy(this.buffer, this.offset);
        this.offset += bytes.length;
        return this;
    }
    
    writeBytes(bytes) {
        this.ensureCapacity(bytes.length);
        if (Buffer.isBuffer(bytes)) {
            bytes.copy(this.buffer, this.offset);
        } else {
            for (let i = 0; i < bytes.length; i++) {
                this.buffer[this.offset + i] = bytes[i];
            }
        }
        this.offset += bytes.length;
        return this;
    }
    
    writeHeader(timeSinceLast, packetType) {
        this.writeUInt16(timeSinceLast);
        this.writeUInt8(packetType);
        return this;
    }
    
    build() {
        return this.buffer.slice(0, this.offset);
    }
    
    reset() {
        this.offset = 0;
        return this;
    }
}


class PacketReader {
    constructor(buffer) {
        this.buffer = buffer;
        this.offset = 0;
    }
    
    get remaining() {
        return this.buffer.length - this.offset;
    }
    
    readUInt8() {
        const value = this.buffer.readUInt8(this.offset);
        this.offset += 1;
        return value;
    }
    
    readInt8() {
        const value = this.buffer.readInt8(this.offset);
        this.offset += 1;
        return value;
    }
    
    readUInt16() {
        const value = this.buffer.readUInt16BE(this.offset);
        this.offset += 2;
        return value;
    }
    
    readUInt24() {
        const value = (this.buffer.readUInt8(this.offset) << 16) | 
                      this.buffer.readUInt16BE(this.offset + 1);
        this.offset += 3;
        return value;
    }
    
    readString(length) {
        const str = this.buffer.toString('utf8', this.offset, this.offset + length);
        this.offset += length;
        return str;
    }
    
    readBytes(length) {
        const bytes = this.buffer.slice(this.offset, this.offset + length);
        this.offset += length;
        return bytes;
    }
    
    skip(bytes) {
        this.offset += bytes;
        return this;
    }
}

module.exports = { PacketBuilder, PacketReader };
