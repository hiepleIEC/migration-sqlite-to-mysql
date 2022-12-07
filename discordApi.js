const https = require('https')
const axios = require('axios')
const _ = require('lodash')

const httpsAgent = new https.Agent({ keepAlive: true })

const endpoint = axios.create({
  baseURL: 'https://discord.com/api/v10/',
  headers: {
    Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept-Encoding': 'application/json',
  },
  httpsAgent,
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
})

const extractData = (res) => res?.data

const discordApi = {
  endpoint,
  listMembers: _.memoize((guildID) =>
    endpoint.get(`/guilds/${guildID}/members`).then(extractData)
  ),
  getMember: _.memoize((guildID, userID) =>
    endpoint.get(`/guilds/${guildID}/members/${userID}`).then(extractData)
  ),
  getMemberByNick: (guildID, nick) =>
    endpoint.get(`/guilds/${guildID}/members/search?query=${nick}`),
}

module.exports = discordApi