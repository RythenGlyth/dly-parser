import fs from "fs"
import { Readable } from "stream"

export interface DLYContainerProvider {
    read(start: number, end: number): Promise<Readable>;
}

export class DLYContainerProviderFS implements DLYContainerProvider {
    constructor(private path: string) {}

    async read(start: number, end: number): Promise<Readable> {
        return fs.createReadStream(this.path, {
            start: start,
            end: end
        });
    }
}