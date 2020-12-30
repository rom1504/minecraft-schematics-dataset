const nbt = require('prismarine-nbt')
const promisify = require('util').promisify
const parseNbt = promisify(nbt.parse)
const {read} = require('.')


async function main() {
    let i = 0
    for await (const schematic of read()) {
        console.log(schematic)

        const parsedNbt = nbt.simplify(await parseNbt(schematic.schematicData))
        console.log(parsedNbt)

        i++
        if (i==2) {
            break
        }
    }
}

main()