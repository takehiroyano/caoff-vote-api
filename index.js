const axios = require('axios')
const SPREADSHEET_API_URL = 'https://sheets.googleapis.com/v4/spreadsheets/'
const SETTING_SHEET_NAME = '設定'
const SETTING_SHEET_RANGES = ['r_title', 'r_body', 'r_hashtag', 'r_sheetname']
const SONGS_SHEET_RANGE = 'A:B'

exports.handler = async (event, context) => {
    let body
    let statusCode = '200'
    const headers = {
        'Content-Type': 'application/json',
    };

    try {
        body = await getInfomation()
    } catch (err) {
        statusCode = '500';
        body = { message: err.message }
    } finally {
        body = JSON.stringify(body)
    }

    return {
        statusCode,
        body,
        headers,
    };
}

const getInfomation = async () => {
    const spreadsheetId = process.env.SPREADSHEET_ID
    const appKey = process.env.SPREADSHEET_APP_KEY
    const settingParamas = new URLSearchParams()
    settingParamas.append("key", appKey)
    SETTING_SHEET_RANGES.forEach((item) => {
        settingParamas.append("ranges", SETTING_SHEET_NAME + '!' + item)
    })
    const settingResponse = await axios.get(SPREADSHEET_API_URL + spreadsheetId + '/values:batchGet', { params: settingParamas })
    const sheetname = settingResponse.data.valueRanges[3].values[0][0]
    const songsResponse = await axios.get(SPREADSHEET_API_URL + spreadsheetId + '/values/' + sheetname + '!' + SONGS_SHEET_RANGE, { params: { key: appKey } })

    return {
        title: settingResponse.data.valueRanges[0].values[0][0],
        body: settingResponse.data.valueRanges[1].values[0][0],
        hashtag: settingResponse.data.valueRanges[2].values[0][0],
        songs: songsResponse.data.values.slice(1).map(
            (item, i) => {
                return {
                    songTitle: item[0],
                    animeTitle: item[1],
                    id: i
                }
            }
        )
    };
}