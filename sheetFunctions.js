const SHEET_ID = process.env.SHEET_ID
const { google } = require('googleapis')
const getAuth = () => {
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  )
  oAuth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  })
  return oAuth2Client
};


const getAuthGoogle = async () => {
  const oAuth2Client = await google.auth.getClient({
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/devstorage.read_only',
    ],
  })
  return google.sheets({ version: 'v4', oAuth2Client })
}

const getSheets = () => {
  const auth = getAuth()
  return google.sheets({ version: 'v4', auth })
}

const getDataFromSheet = async (sheetId, sheetName) => {
  const sheets = getSheets()
  const {
    data: { values },
  } = await sheets.spreadsheets.values.get({
    spreadsheetId: sheetId,
    range: `${sheetName}!A:K`,
  })
  return { sheets, values }
}

const updateRowSheet = (sheets, row, rowValue) => {
  return sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `List!A${row}:D${row}`,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [rowValue],
    },
  })
}

const deleteRow = (sheets, sheetId, row) => {
  const batchUpdateRequest = {
    requests: [
      {
        deleteDimension: {
          range: {
            sheetId: 0,
            dimension: 'ROWS',
            startIndex: parseInt(row - 1),
            endIndex: parseInt(row),
          },
        },
      },
    ],
  }
  return sheets.spreadsheets.batchUpdate({
    spreadsheetId: sheetId,
    resource: batchUpdateRequest,
  })
}


module.exports = getSheets