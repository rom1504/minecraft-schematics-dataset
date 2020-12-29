const nbt = require('prismarine-nbt')
const promisify = require('util').promisify
const parseNbt = promisify(nbt.parse)
const read = require('../reader')
const fs = require('fs').promises
const zlib = require('zlib')
const gzipPromise = promisify(zlib.gunzip)
const { Schematic } = require('prismarine-schematic')
const {
  performance
} = require('perf_hooks');

const hasGzipHeader = function (data) {
  let result = true
  if (data[0] !== 0x1f) result = false
  if (data[1] !== 0x8b) result = false
  return result
}


async function main() {
    let i = 0
    const begin = performance.now()
    const names = []
    for await (const schematic of read()) {
        //console.log(schematic)

        const b = performance.now()


        const data = schematic.schematicData

        try {
            let uncompressed = hasGzipHeader(data) ? await gzipPromise(data) : data
            if (uncompressed.length >= 10000000) {
                console.log('too big, skipped', uncompressed.length / 1000000)
                continue
            }
            // const parsedNbt = nbt.simplify(await parseNbt(uncompressed))
            const schem = await Schematic.read(uncompressed)

            const id = schematic.url.split("/")[schematic.url.split("/").length-2]
            console.log(id)
            if (schem.size.x < 30 && schem.size.z < 30) {
                await fs.writeFile("viewer/public/schem/"+id+".schematic", data)
                names.push("schem/"+id+".schematic")
            }
        } catch(err) {
            console.log('failed', err)
        }
        console.log(performance.now() - b)
        //console.log(parsedNbt)

        i++
        if (i==1000) {
            break
        }
    }
    await fs.writeFile('viewer/public/names.json', JSON.stringify(names, null, 2))

    console.log(performance.now() - begin)
}

main()