const tfrecord = require('tfrecord')
const fs = require('fs').promises
const { Schematic } = require('prismarine-schematic')
const Vec3 = require('vec3').Vec3
const {write} = require('..')

async function main() {

    const records = []
    const reader = await tfrecord.createReader('/workspace/minecraft-schematics-dataset/small.tfrecord')
    let example
    const enc = new TextDecoder()
    let smallY = 0
    let total = 0
    while (example = await reader.readExample()) { // eslint-disable-line
        const url = enc.decode(example.features.feature.url.bytesList.value[0])
        const schematicData = Buffer.from(example.features.feature.schematicData.bytesList.value[0])
        try {
        const schem = await Schematic.read(schematicData, '1.16.4')
        total+=1
        console.log(schem.size.y)
        if (schem.size.y <= 32) {
            // get 0-31 x 3 and put in x y z array of int16
            let arr = new Uint16Array(32*32*32)
            let i= 0
            for (let x=0; x<32; x++){
                for (let y=0; y<32; y++){
                    for (let z=0; z<32; z++){
                    
                        let val = 0
                        if (x < schem.size.x && y < schem.size.y && z < schem.size.z) {
                            val = schem.getBlockStateId(new Vec3(x, y, z).plus(schem.start()))
                        }
                        arr[i] = val
                        i+=1
                    }
                }
            }
            const arr8 = new Uint8Array(arr.buffer, arr.byteOffset, arr.byteLength)
                records.push({url: url, schematicData: arr8}
                    )

            smallY+=1
        }
        console.log(smallY,'/',total)
        }catch(err) {
            console.log(err)
        }
    }

    await write("/workspace/minecraft-schematics-dataset/good_small.tfrecord", records)

}
main()