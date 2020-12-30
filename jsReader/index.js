const tfrecord = require('tfrecord')

async function* read () {
  const metadata = require(__dirname+'/../data/schematicsWithFinalUrl.json')
  const indexedMetadata = Object.fromEntries(metadata.map(e => [e.url, e]))
  const reader = await tfrecord.createReader(__dirname+'/../data/schematics_0.tfrecords')
  let example
  const enc = new TextDecoder()
  while (example = await reader.readExample()) { // eslint-disable-line
    const url = enc.decode(example.features.feature.url.bytesList.value[0])
    const schematicData = Buffer.from(example.features.feature.schematicData.bytesList.value[0])
    const metadata = indexedMetadata[url]
    yield {schematicData, ...metadata}
  }
}

async function* simpleRead () {
  const reader = await tfrecord.createReader(__dirname+'/../data/schematics_0.tfrecords')
  let example
  const enc = new TextDecoder()
  while (example = await reader.readExample()) { // eslint-disable-line
    const url = enc.decode(example.features.feature.url.bytesList.value[0])
    const schematicData = Buffer.from(example.features.feature.schematicData.bytesList.value[0])
    yield {schematicData, url}
  }
}


async function write (filename, examples) {
  const builder = tfrecord.createBuilder()

  const writer = await tfrecord.createWriter(filename)
  for (const example of examples) {
    const enc = new TextEncoder() // always utf-8
    builder.setBinary('url', enc.encode(example.url))
    builder.setBinary('schematicData', example.schematicData)
    const exampleTf = builder.releaseExample()

    await writer.writeExample(exampleTf)
  }

  await writer.close()
}

module.exports = {simpleRead,read,write}