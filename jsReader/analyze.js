const nbt = require('prismarine-nbt')
const promisify = require('util').promisify
const parseNbt = promisify(nbt.parse)
const read = require('./reader')


async function main() {
    let j = 0
    let i = 0
    for await (const schematic of read()) {
        console.log(schematic.date)

        try {
            const parsedNbt = nbt.simplify(await parseNbt(schematic.schematicData))
            console.log(Object.keys(parsedNbt))
            const palettes = new Set(['Palette', 'SchematicaMapping'])
            j+=Object.keys(parsedNbt).filter(x => palettes.has(x)).length === 0
        } catch(err) {

        }
        i++
        if (i === 50) {
            break
        }
    }
    console.log(j)
}

main()