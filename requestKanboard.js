require('dotenv').config()
const axios = require('axios')
const KANBOARD_URL_V2 =
  'https://us-central1-united-data.cloudfunctions.net/kanboard-query'
const axiosConfig = {
  auth: {
    username: 'jsonrpc',
    password: process.env.KANBOARD_TOKEN,
  },
}

exports.requestKanboard = async (method, params) => {
  try {
    const result = await axios.post(
      `${process.env.KANBOARD_URL}/jsonrpc.php`,
      {
        jsonrpc: '2.0',
        method,
        id: 8,
        params,
      },
      axiosConfig
    )
    if (!result.data.result) console.warn(method, params, result.data)
    return result.data.result
  } catch (error) {
    if (error.response) {
      if (error.response.config) {
        throw error.response.config.data
      }
      if (error.response.data) {
        throw error.response.data
      }
    } else {
      throw error
    }
  }
}

exports.requestPostKanboardV2 = async (method, params) => {
  if (process.env.KANBOARD_TOKEN && process.env.KANBOARD_URL)
    return this.requestKanboard(method, params)
  const payload = { method, ...params, json: true }
  const config = {
    method: 'POST',
    url: KANBOARD_URL_V2,
    data: payload,
  }
  return axios(config)
    .then((response) => JSON.stringify(response.data))
    .then((data) => JSON.parse(data))
}
