const Schematic = require('prismarine-schematic').Schematic
const Vec3 = require('vec3').Vec3
const fs = require('fs')

async function main() {
  const version = '1.16.4'
  const viewDistance = 20
  const center = new Vec3(0, 90, 0)

  const World = require('prismarine-world')(version)
  const Chunk = require('prismarine-chunk')(version)

  const chunkGenerator = (chunkX, chunkZ) => {
    const chunk = new Chunk()
    for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
            chunk.setBlockStateId(new Vec3(x, 59, z), 1)
        }
    }
    return chunk
  }

  const world = new World(chunkGenerator)

const data = fs.readFileSync('public/schem/argenau.schematic')
const schem = await Schematic.read(data, version)
await schem.paste(world, new Vec3(0, 60, 0))

}
main()