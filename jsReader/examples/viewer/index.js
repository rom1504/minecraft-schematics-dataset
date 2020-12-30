/* global THREE, fetch */
const { WorldView, Viewer } = require('prismarine-viewer/viewer')
const { Vec3 } = require('vec3')
global.THREE = require('three')
require('three/examples/js/controls/OrbitControls')

const { Schematic } = require('prismarine-schematic')
const { Buffer } = require('buffer')

async function simpleRead () {
  return await (await fetch('small.json')).json()
}

async function main () {
  const version = '1.16.4'
  const viewDistance = 25
  const center = new Vec3(0, 90, 0)

  const World = require('prismarine-world')(version)
  const Chunk = require('prismarine-chunk')(version)

  const chunkGenerator = (chunkX, chunkZ) => {
    const chunk = new Chunk()
    for (let x = 0; x < 16; x++) {
      for (let z = 0; z < 16; z++) {
        chunk.setBlockStateId(new Vec3(x, 59, z), 9)
      }
    }
    return chunk
  }

  const world = new World(chunkGenerator)
  const worldView = new WorldView(world, viewDistance, center)

  const newSchemP = []
  for (const schematic of await simpleRead()) {
    newSchemP.push(Schematic.read(Buffer.from(schematic.schematicData.data)))
  }
  const newSchem = await Promise.all(newSchemP)
  console.log(newSchem.length)

  let x = -200
  let z = -100
  let maxZ = 0
  for (const schematic of newSchem) {
    console.log(schematic.size)
    await schematic.paste(world, new Vec3(x, 60, z))
    x += 5 + schematic.size.x
    maxZ = Math.max(schematic.size.z, maxZ)
    if (x > 200) {
      x = -200
      z += maxZ + 5
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
