const axios = require("axios");
const fs = require("fs").promises;
const qs = require("qs");
const HOST = `https://us-central1-united-data.cloudfunctions.net/kanboard-query`;

const createFile = (filename) =>
  fs
    .open(filename, "r")
    .then(() => {
      console.log(`File ${filename} is existed.`);
    })
    .catch(async () => {
      await fs.writeFile(filename, "");
      console.log(`File ${filename} was created.`);
    });
const requestKanboard = async (method, params) => {
  if (process.env.KANBOARD_TOKEN && process.env.KANBOARD_URL) {
    const axiosConfig = {
      auth: {
        username: "jsonrpc",
        password: process.env.KANBOARD_TOKEN,
      },
    };
    const payload = {
      jsonrpc: "2.0",
      method,
      id: 1,
      params,
    };
    const result = await axios.post(
      `${process.env.KANBOARD_URL}/jsonrpc.php`,
      payload,
      axiosConfig
    );
    return result.data.result;
  }
  else {
    const payload = { method, ...params, json: true };
    const config = {
      method: "POST",
      url: HOST,
      data: payload,
    };
    return axios(config).then((response) => JSON.stringify(response.data)).then(rawData => JSON.parse(rawData));
  }
};

module.exports = {
  requestKanboard,
  createFile,
};
