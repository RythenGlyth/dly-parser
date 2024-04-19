const { describe } = require('mocha')
const { DLYContainerProviderFS, DLYContainer } = require('../dist')
const fs = require('fs')

describe('DLYContainer', () => {
    it('should parse header', async () => {
        const provider = new DLYContainerProviderFS("./test_files/BVN1_2283_9171.dly")
        const container = new DLYContainer(provider)

        const length = await container.getFilesCount()
        const files = await container.parseFileHeaders(0, 5)
        fs.mkdirSync("./test_files/BVN1_2283_9171", { recursive: true })
        for (const file of files) {
            await new Promise(async (resolve, reject) => (await file.readFile()).pipe(fs.createWriteStream("./test_files/BVN1_2283_9171/" + file.name)).on('finish', resolve).on('error', reject))
        }
    })
})