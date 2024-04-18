import fs from "fs"
import { Readable } from "stream"

export interface DLYContainerProvider {
    read(start: number, end: number): Readable;
}

export class DLYContainerProviderFS implements DLYContainerProvider {
    constructor(private path: string) {}

    read(start: number, end: number): Readable {
        return fs.createReadStream(this.path, {
            start: start,
            end: end
        });
    }
}