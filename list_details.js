const assert = require('assert')
const fs = require('fs')
const { get } = require('axios')
const cheerio = require('cheerio')

const listings = JSON.parse(fs.readFileSync('listings.json'))

async function getDetails (url) {
  const res = await get(url)
  const $ = cheerio.load(res.data)

  return parseText($)
}

const keys = [
  'Missing Since',
  'Missing From',
  'Classification',
  'Date of Birth',
  'Age',
  'Height and Weight',
  'Height',
  'Weight',
  'Clothing/Jewelry Description',
  'Distinguishing Characteristics',
  'Medical Conditions'
]
const headers = keys.filter(k => k !== 'Height and Weight')

function parseText ($) {
  const detailsColumn = $('.column')[1]
  const items = $(detailsColumn).find('li')
  return items.map((index, item) => {
    const $item = $(item)
    const title = $item.find('strong')
    const titleText = title.text()

    assert(keys.includes(titleText))

    // erase it
    title.text('')
    const val = $item.text().trim().replace(/\t/g, '')

    if (titleText == 'Height and Weight') {
      const splits = val.split(', ')
      return {
        Height: splits[0],
        Weight: splits[1]
      }
    } else {
      return {
        [titleText]: val
      }
    }
  }).toArray().reduce((all, one) => Object.assign(all, one), {})
}

function needsEscaping (val) {
  return val.includes('\n') || val.includes('"') || val.includes(',')
}

function escapeChars (val) {
  return val.replace(/"/g, '""')
}

function escape (val) {
  return typeof val === 'string' && needsEscaping(val)
    ? `"${escapeChars(val)}"`
    : val
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

;(async () => {
  const sep = '\t'
  const random = Math.floor(Math.random() * listings.length)
  console.log(headers.join(sep))

  for (var i = 0; i < listings.length; i++) {
    const details = await getDetails(listings[i].url)
    console.log(
      headers
        .map(h => escape(details[h] || ''))
        .join(sep)
    )
    await sleep(300)
  }
})()

