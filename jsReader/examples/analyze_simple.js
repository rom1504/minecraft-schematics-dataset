const fs = require('fs').promises
const { Schematic } = require('prismarine-schematic')
const nbt = require('prismarine-nbt')
const promisify = require('util').promisify
const parseNbt = promisify(nbt.parse)

async function main () {
  // Read a schematic (sponge or mcedit format)
  const schematic = await Schematic.read(await fs.readFile('schem/super-market.schematic'))
    console.log(schematic)
  console.log(Object.keys(nbt.simplify(await parseNbt(await fs.readFile('schem/super-market.schematic')))))
}

main()