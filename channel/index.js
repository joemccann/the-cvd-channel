require('dotenv').config()
const { news, stats } = require('./src/commands')
const { format } = require('./src/format')
const { read, write } = require('./src/fs')
const { objectCompare } = require('./src/util')

const broadcast = require('./src/http')

module.exports = async function (context, myTimer) {
  let newsMessage = ''
  let statsMessage = ''
  let isLatestData = false
  //
  // Fetch all news and stats from network sources
  //
  const { err: newsErr, data: newsData } = await news()
  if (newsErr) {
    console.error(newsErr.message)
    return { err: newsErr }
  }

  const { err: statsErr, data: statsData } = await stats()
  if (statsErr) {
    console.error(statsErr.message)
    return { err: statsErr }
  }

  //
  // Fetch all news and stats from files
  //
  const { err: readErr, data: readFileData } = await read({
    container: 'the-cvd-bot-blob-container',
    filename: 'latest-data.json'
  })

  if (readErr && readErr.message &&
     readErr.message === 'Unexpected status code: 404') {
    console.log('File doesn\'t exist. Use HTTP data.')
  } else if (readErr) {
    console.error(readErr.message)
    return { err: readErr }
  }

  const httpData = { stats: statsData, news: newsData }
  //
  // Compare old records vs. new records
  // If true, data is the same, so it is up to date.
  // If false, data is not the same, so it is not up to date.
  //
  isLatestData = objectCompare(httpData, readFileData)

  if (!isLatestData) {
    console.log(`Data is out of date: ${(new Date()).toLocaleDateString()}`)
  } else {
    const msg = 'Data is up to date. No broadcast necessary.'
    console.info(msg)
    return { data: msg, err: null }
  }

  //
  // Diff the news articles
  //

  const diff = {
    articles: null
  }
  diff.articles = httpData.news.articles
    .filter(x => !readFileData.news.articles.includes(x))

  // Write updates to a file
  //
  const { err: writeFileErr } = await write({
    content: JSON.stringify(httpData),
    container: 'the-cvd-bot-blob-container',
    filename: 'latest-data.json'
  })

  if (writeFileErr) {
    return { err: readErr.message }
  }

  //
  // Format all news and stats messages
  //
  const { err: nFormatErr, data: formattedNews } = await format({
    type: 'news',
    data: diff
  })

  if (nFormatErr) {
    console.error(nFormatErr.message)
    return { err: nFormatErr }
  }
  newsMessage = formattedNews

  const { err: sFormatErr, data: formattedStats } = await format({
    type: 'stats',
    data: httpData.stats
  })

  if (sFormatErr) {
    console.error(sFormatErr.message)
    return { err: sFormatErr }
  }
  statsMessage = formattedStats

  //
  // Send the messages to the channel
  //
  {
    const { err } = await broadcast({
      message: newsMessage,
      mode: 'markdown'
    })
    if (err) {
      console.error(err.message)
      return { err }
    }
  }

  {
    const { err } = await broadcast({
      message: statsMessage,
      mode: 'markdown'
    })
    if (err) {
      console.error(err.message)
      return { err }
    }
  }

  const msg = '✓ Broadcast successfully sent.'
  console.info(msg)
  return { data: 'Broadcast sent.', err: null }
}
