const { describe } = require('mocha')
const { DLYContainerProviderFS, DLYContainer } = require('../dist')

describe('DLYContainer', () => {
    it('should parse header', async () => {
        const provider = new DLYContainerProviderFS("./test_files/BVN1_2283_9171.dly")
        const container = new DLYContainer(provider)

        console.log(await container.parseHeader())
    })
})