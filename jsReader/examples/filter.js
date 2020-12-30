const nbt = require('prismarine-nbt')
const promisify = require('util').promisify
const parseNbt = promisify(nbt.parse)
const {read, write} = require('..')
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
    const records = []
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
            const parsedNbt = nbt.simplify(await parseNbt(uncompressed))
            //const schem = await Schematic.read(uncompressed)

            const id = schematic.url.split("/")[schematic.url.split("/").length-2]
            console.log(id)
            if (parsedNbt.Width < 30 && parsedNbt.Length < 30) {
                records.push({url: schematic.url, schematicData: schematic.schematicData})
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
    await write("viewer/public/small.tfrecord", records)

    console.log(performance.now() - begin)
}


main()