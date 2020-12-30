const tfrecord = require('tfrecord')
const fs = require('fs').promises

async function main() {

    const r = []
    const reader = await tfrecord.createReader('viewer/public/all_small.tfrecord')
    let example
    const enc = new TextDecoder()
    while (example = await reader.readExample()) { // eslint-disable-line
        const url = enc.decode(example.features.feature.url.bytesList.value[0])
        const schematicData = Buffer.from(example.features.feature.schematicData.bytesList.value[0])
        r.push({schematicData, url})
    }


    await fs.writeFile("viewer/public/all_small.json", JSON.stringify(r))
}
main()