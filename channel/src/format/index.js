const { stripIndent } = require('common-tags')
const format = async ({ type = '', data = {} }) => {
  if (!type) return { err: new Error('Formatting requires a type.') }

  if (type === 'news') {
    const { articles = [] } = data

    if (!articles.length) {
      return {
        err: new Error('No news articles to format.')
      }
    }

    const links = []

    articles.slice(0, 5).forEach(async (article, i) => {
      const {
        title,
        url
      } = article
      const msg = `[${i + 1}. ${title}](${url})\n`
      links.push(msg)
    })

    {
      const data = links.join('\n')
      return { data }
    }
  }

  if (type === 'stats') {
    const { cases = 0, deaths = 0, recovered = 0 } = data

    let cfr = 0

    try {
      cfr = ((deaths / cases) * 100).toFixed(2) + '%'
    } catch (err) {
      cfr = '0.0%'
      console.error(err.message)
    }

    {
      const data = stripIndent`
      🦠 Total Number of Cases: *${(cases).toLocaleString('en')}* 

      💀 Total Number of Deaths: *${(deaths).toLocaleString('en')}* 

      🤞🏼 Total Number of Recoveries: *${(recovered).toLocaleString('en')}* 

      ⚰️  Case Fatality Rate: *${(cfr).toLocaleString('en')}* 
      `
      return { data }
    }
  }

  return { err: new Error(`Type: ${type}, not supported for formatting.`) }
}

module.exports = { format }
