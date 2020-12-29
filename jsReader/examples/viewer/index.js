/* global THREE XMLHttpRequest */
const { WorldView, Viewer } = require('prismarine-viewer/viewer')
const { Vec3 } = require('vec3')
global.THREE = require('three')
require('three/examples/js/controls/OrbitControls')

const { Schematic } = require('prismarine-schematic')
const names = require('./public/names.json')


async function main (){

  const version = '1.16.4'
  const viewDistance = 8
  const center = new Vec3(0, 90, 0)

  const World = require('prismarine-world')(version)
  const Chunk = require('prismarine-chunk')(version)

  const generator = (x, y, z) => {
    if (y < 60) return 1
    return 0
  }
  const chunkGenerator = (chunkX, chunkZ) => {
    const chunk = new Chunk()
    for (let y = 0; y < 256; y++) {
      for (let x = 0; x < 16; x++) {
        for (let z = 0; z < 16; z++) {
          chunk.setBlockStateId(new Vec3(x, y, z), generator(chunkX * 16 + x, y, chunkZ * 16 + z))
        }
      }
    }
    return chunk
  }

  const world = new World(chunkGenerator)
  const worldView = new WorldView(world, viewDistance, center)

  function getRandomSubarray(arr, size) {
        var shuffled = arr.slice(0), i = arr.length, temp, index;
        while (i--) {
            index = Math.floor((i + 1) * Math.random());
            temp = shuffled[index];
            shuffled[index] = shuffled[i];
            shuffled[i] = temp;
        }
        return shuffled.slice(0, size);
    }
  const subNames = getRandomSubarray(names, 100)

  const schematics = await Promise.all(subNames.map(async (name, i) => {
    const data = await fetch(name).then(r => r.arrayBuffer())
    const schem = await Schematic.read(Buffer.from(data), version)
    return schem
  }))

  let x = -80
  let z = -50
  let maxZ = 0
  for (const schematic of schematics) { 
    console.log(schematic.size)
    await schematic.paste(world, new Vec3(x, 60, z))
    x+=5 + schematic.size.x
    maxZ = Math.max(schematic.size.z, maxZ)
    if (x > 80) {
        x = -50
        z+= maxZ + 5
        maxZ = 0
    }
  }

  // Create three.js context, add to page
  const renderer = new THREE.WebGLRenderer()
  renderer.setPixelRatio(window.devicePixelRatio || 1)
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  // Create viewer
  const viewer = new Viewer(renderer)
  viewer.setVersion(version)
  // Attach controls to viewer
  const controls = new THREE.OrbitControls(viewer.camera, renderer.domElement)

  // Link WorldView and Viewer
  viewer.listen(worldView)
  // Initialize viewer, load chunks
  worldView.init(center)

  viewer.camera.position.set(center.x, center.y, center.z)
  controls.update()

  // Browser animation loop
  const animate = () => {
    window.requestAnimationFrame(animate)
    if (controls) controls.update()
    worldView.updatePosition(controls.target)
    renderer.render(viewer.scene, viewer.camera)
  }
  animate()
}

main()
