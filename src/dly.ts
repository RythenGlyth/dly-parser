import { Readable } from "stream"
import consumers from "stream/consumers"
import { DLYContainerProvider } from "./container_provider"
import { BufferReader } from "./utils"

export class DLYContainer {
    private header?: DIYContainerHeader
    private meta1?: string[]
    private meta2?: string[]
    private fileHeaderBlockSize?: number
    private filesCount?: number
    constructor(private containerProvider: DLYContainerProvider) {
        
    }

    async parseHeader(): Promise<DIYContainerHeader> {
        const headerData = new BufferReader(await consumers.buffer(await this.containerProvider.read(0, 64)))
        const magic = headerData.readUInt32BE()
        if (magic !== 0x444C5900) {
            throw new Error("Invalid magic number / not a DLY file")
        }
        const archiveVersion = headerData.readUInt32BE()
        const unknown = headerData.readUInt32LE()
        const meta1Offset = headerData.readUInt32LE()
        const meta2Offset = headerData.readUInt32LE()
        const filesCountOffset = headerData.readUInt32LE()
        const unknownOffset2 = headerData.readUInt32LE()
        const unknownOffset3 = headerData.readUInt32LE()
        const paddingOffset = headerData.readUInt32LE()
        const unknownOffset4 = headerData.readUInt32LE()
        const unknownOffset5 = headerData.readUInt32LE()
        const unknownOffset6 = headerData.readUInt32LE()
        const unknownOffset7 = headerData.readUInt32LE()
        const unknownOffset8 = headerData.readUInt32LE()
        const firstFileHeaderOffset = headerData.readUInt32LE()
        const dataOffset = headerData.readUInt32LE()


        return this.header = {
            magic,
            archiveVersion,
            unknown,
            meta1Offset,
            meta2Offset,
            filesCountOffset,
            unknownOffset2,
            unknownOffset3,
            paddingOffset,
            unknownOffset4,
            unknownOffset5,
            unknownOffset6,
            unknownOffset7,
            unknownOffset8,
            firstFileHeaderOffset,
            dataOffset,
        }
    }

    // async files(): Promise<FilesArray> {
    //     if (!this.header) {
    //         await this.parseHeader()
    //     }
    //     if(!this.header) {
    //         throw new Error("Failed to parse header")
    //     }
    //     const filesCount = new BufferReader(await consumers.buffer(this.containerProvider.read(this.header.filesCountOffset, this.header.filesCountOffset+4))).readUInt32LE()
    //     return new FilesArray(this, filesCount, (this.header.dataOffset - this.header.firstFileHeaderOffset) / filesCount)
    // }

    async getFilesCount(): Promise<number> {
        if (!this.header) {
            await this.parseHeader()
        }
        if(!this.header) {
            throw new Error("Failed to parse header")
        }
        if(!this.filesCount) {
            this.filesCount = new BufferReader(await consumers.buffer(await this.containerProvider.read(this.header.filesCountOffset, this.header.filesCountOffset+4))).readUInt32LE()
        }
        return this.filesCount
    }

    /**
     * parse file headers from `from` to `to`
     * @param from start index (inclusive)
     * @param to end index (exclusive)
     * @returns array of file headers
     */
    async parseFileHeaders(from: number, to: number): Promise<FileHeader[]> {
        if (!this.header) {
            await this.parseHeader()
        }
        if(!this.header) {
            throw new Error("Failed to parse header")
        }
        if(!this.filesCount) {
            this.filesCount = new BufferReader(await consumers.buffer(await this.containerProvider.read(this.header.filesCountOffset, this.header.filesCountOffset+4))).readUInt32LE()
        }
        if(!this.fileHeaderBlockSize) {
            this.fileHeaderBlockSize = (this.header.dataOffset - this.header.firstFileHeaderOffset) / this.filesCount
        }
        const dataOffset = this.header.dataOffset
        const fileHeaderData = new BufferReader(await consumers.buffer(await this.containerProvider.read(this.header.firstFileHeaderOffset + from * this.fileHeaderBlockSize, this.header.firstFileHeaderOffset + to * this.fileHeaderBlockSize)))
        
        let fileHeaders: FileHeader[] = []
        for (let i = from; i < to; i++) {
            fileHeaderData.offset = i * this.fileHeaderBlockSize
            const startOffset = fileHeaderData.readUInt32LE()
            const length = fileHeaderData.readUInt32LE()
            const name = fileHeaderData.readNullTerminatedString()
            fileHeaders.push({
                name,
                startOffset,
                length,
                readFile: () => {
                    return this.containerProvider.read(dataOffset + startOffset, dataOffset + startOffset + length)
                }
            })
        }
        return fileHeaders
    }
}

type DIYContainerHeader = {
    magic: number,
    archiveVersion: number,
    /** maybe subversion? */
    unknown: number,
    meta1Offset: number,
    meta2Offset: number,
    filesCountOffset: number,
    unknownOffset2: number,
    unknownOffset3: number,
    paddingOffset: number,
    unknownOffset4: number,
    unknownOffset5: number,
    unknownOffset6: number,
    unknownOffset7: number,
    unknownOffset8: number,
    firstFileHeaderOffset: number,
    dataOffset: number,
}

type FileHeader = {
    name: string,
    startOffset: number,
    length: number,
    readFile(): Promise<Readable>
}