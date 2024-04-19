

export class BufferReader {
    constructor(public buffer: Buffer, public offset = 0) {
    }

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
    readStringArray(): string[] {
        //read strings until 0x01 terminator
        let strings: string[] = []
        while (this.buffer.readUInt32LE(this.offset) !== 0x01) {
            console.log(this.buffer.readUInt32LE(this.offset).toString(16));
            strings.push(this.readString())
        }
        this.offset += 4
        return strings
    }
    readNullTerminatedString(): string {
        let i = this.offset
        while (this.buffer[i] !== 0) {
            i++
        }
        let str = this.buffer.toString("utf-8", this.offset, i)
        this.offset = i + 1
        return str
    }
}

export function readNullTerminatedString(buffer: Buffer, offset: number): string {
    let i = offset
    while (buffer[i] !== 0) {
        i++
    }
    return buffer.toString("utf-8", offset, i)
}

export function formatBytes(bytes: number, base: number = 1024, decimals: number = 2, fix_decimals: boolean = false) {
    if (!(0+bytes)) return '0 Bytes'

    const sizes = base == 1024 ? ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'] : ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

    const unit = Math.floor(Math.log(bytes) / Math.log(base))

    let numStr = (bytes / Math.pow(base, unit)).toFixed(decimals < 0 ? 0 : decimals)
    return `${fix_decimals ? numStr : parseFloat(numStr)} ${sizes[unit]}`
}