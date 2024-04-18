import consumers from "stream/consumers"
import { DLYContainerProvider } from "./container_provider"

export class DLYContainer {
    constructor(private containerProvider: DLYContainerProvider) {
        
    }

    async parseHeader(): Promise<DIYContainerHeader> {
        const headerData = await consumers.buffer(this.containerProvider.read(0, 64))
        const magic = headerData.readUInt32BE(0)
        if (magic !== 0x444C5900) {
            throw new Error("Invalid magic number / not a DLY file")
        }
        const archiveVersion = headerData.readUInt32BE(4)


        return {
            magic,
            archiveVersion
        }

    }
}

type DIYContainerHeader = {
    magic: number,
    archiveVersion: number
}