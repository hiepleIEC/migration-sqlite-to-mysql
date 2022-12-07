const { google } = require('googleapis')
module.exports = {
 getAuth: () => {
  const oAuth2Client = new google.auth.OAuth2(
   process.env.GOOGLE_CLIENT_ID,
   process.env.GOOGLE_CLIENT_SECRET,
   process.env.GOOGLE_REDIRECT_URI
  )
  oAuth2Client.setCredentials({
   refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  })
  return oAuth2Client
 },
}
