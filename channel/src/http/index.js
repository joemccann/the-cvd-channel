const fetch = require('node-fetch')

module.exports = async ({ url = '', message = '', mode = 'markdown' }) => {
  let POST_URL = (url || process.env.CHANNEL_URL)

  try {
    POST_URL = POST_URL
      .replace('{mode}', mode)
      .replace('{text}', encodeURI(message))

    const response = await fetch(POST_URL)

    if (!response.ok) return { err: new Error(response.statusText) }

    const data = await response.json()

    return { data }
  } catch (err) {
    return { err }
  }
}
