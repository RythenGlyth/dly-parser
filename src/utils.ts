

export class BufferReader {
    constructor(private buffer: Buffer, private offset = 0) {}

    readUInt32BE(): number {
        let num = this.buffer.readUInt32BE(this.offset)
        this.offset += 4
        return num
    }
    readUInt32LE(): number {
        let num = this.buffer.readUInt32LE(this.offset)
        this.offset += 4
        return num
    }
    readString(): string {
        let length = this.readUInt32LE()
        let str = this.buffer.toString("utf-8", this.offset, this.offset + length)
        this.offset += length
        return str
    }
}