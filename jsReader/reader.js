const tfrecord = require('tfrecord')
const metadata = require('../data/schematicsWithFinalUrl.json')
const indexedMetadata = Object.fromEntries(metadata.map(e => [e.url, e]))

async function* read () {
  const reader = await tfrecord.createReader('../data/schematics_0.tfrecords')
  let example
  const enc = new TextDecoder()
  while (example = await reader.readExample()) { // eslint-disable-line
    const url = enc.decode(example.features.feature.url.bytesList.value[0])
    const schematicData = Buffer.from(example.features.feature.schematicData.bytesList.value[0])
    const metadata = indexedMetadata[url]
    yield {schematicData, ...metadata}
  }
}

module.exports = read