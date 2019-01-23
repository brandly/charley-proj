const fs = require('fs')
const listings = JSON.parse(fs.readFileSync('listings.json'))
console.log(listings.length)
