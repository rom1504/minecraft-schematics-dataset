const tfrecord = require('tfrecord')
const fs = require('fs').promises

async function main () {

    const reader = await tfrecord.createReader("viewer/public/all_small.tfrecord")
    let example
    const enc = new TextDecoder()
    let i =0
    while (example = await reader.readExample()) { // eslint-disable-line
        i+=1
        if (i%1000 === 0) {
            console.log(i)
        }
    }
    console.log(i)
}

main()