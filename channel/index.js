require('dotenv').config()
const { news, stats } = require('./src/commands')
const { format } = require('./src/format')
const { read, write } = require('./src/fs')
const { objectCompare } = require('./src/util')

const broadcast = require('./src/http')

module.exports = async function (context, myTimer) {
  let newsMessage = ''
  let statsMessage = ''
  let isLatestNews = false
  let isLatestStats = false
  //
  // Fetch all news and stats from network sources
  //
  try {
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
    isLatestNews = objectCompare(httpData.news, readFileData.news)
    isLatestStats = objectCompare(httpData.stats, readFileData.stats)

    if (!isLatestNews) {
      console.log(`News is out of date: ${(new Date()).toLocaleDateString()}`)
      //
      // diff the news articles
      //
      const diffNews = {
        articles: null
      }
      diffNews.articles = httpData.news.articles
        .filter(x => !readFileData.news.articles.includes(x))
      //
      // Format all news and stats messages
      //
      const { err: nFormatErr, data: formattedNews } = await format({
        type: 'news',
        data: diffNews
      })

      if (nFormatErr) {
        console.error(nFormatErr.message)
        return { err: nFormatErr }
      }
      newsMessage = formattedNews

      //
      // Send the news message to the channel
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
      const msg = '✓ News successfully sent.'
      console.info(msg)
    } else {
      const msg = 'News is up to date. No broadcast necessary.'
      console.info(msg)
    }

    if (!isLatestStats) {
      console.log(`Stats is out of date: ${(new Date()).toLocaleDateString()}`)

      const { err: sFormatErr, data: formattedStats } = await format({
        type: 'stats',
        data: httpData.stats
      })

      if (sFormatErr) {
        console.error(sFormatErr.message)
        return { err: sFormatErr }
      }
      statsMessage = formattedStats

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

      const msg = '✓ Stats Broadcast successfully sent.'
      console.info(msg)
    } else {
      const msg = 'Stats are up to date. No broadcast necessary.'
      console.info(msg)
    }

    //
    // Write updates to a file
    //
    if (!isLatestNews || !isLatestStats) {
      const { err: writeFileErr } = await write({
        content: JSON.stringify(httpData),
        container: 'the-cvd-bot-blob-container',
        filename: 'latest-data.json'
      })

      if (writeFileErr) {
        return { err: readErr.message }
      }
      const msg = '✓ File successfully written to storage.'
      console.info(msg)
    }

    return { data: 'Function executed with no errors.', err: null }
  } catch (err) {
    console.error('Outer scope exception caught.')
    console.error(err.message)
    console.error(err.stack)
    return { err }
  }
}
