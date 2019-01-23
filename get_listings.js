const axios = require('axios')
const cheerio = require('cheerio')

// https://stackoverflow.com/questions/12376870/create-an-array-of-characters-from-specified-range
function range(start, stop) {
  var result=[];
  for (var idx=start.charCodeAt(0),end=stop.charCodeAt(0); idx <=end; ++idx){
    result.push(String.fromCharCode(idx));
  }
  return result;
};

function flatten (list) {
  return list.reduce(
    ((flat, item) => flat.concat(item)),
    []
  )
}

;(async () => {
  const responses = await Promise.all(
    range('A', 'Z')
      .map(async letter => {
        return await axios.get('http://charleyproject.org/case-searches/alphabetical-cases?letter=' + letter)
      })
  )

  const listings = flatten(responses.map(res => {
    const $ = cheerio.load(res.data)
    return $('.case a').map((i, el) =>
      ({ name: $(el).text(), url: $(el).attr('href') })
    ).toArray()
  }))
  console.log(JSON.stringify(listings, null, 2))
})()
