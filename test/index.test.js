const assert = require('assert')
const sinon = require('sinon')
const target = require('../index.js')
const axios = require('axios')
const event = ""
const context = ""

describe('index.js test', () => {
  let sandbox;
  beforeEach(() => {
    process.env.SPREADSHEET_ID = ''
    process.env.SPREADSHEET_APP_KEY = ''
    sandbox = sinon.createSandbox()
  })

  it('正常系', async () => {
    const expectedSettingResult = {
      data: {
        "spreadsheetId": "hogehuga",
        "valueRanges": [
          {
            "range": "'設定'!B8",
            "majorDimension": "ROWS",
            "values": [
              [
                "COUNT DOWN CAOFF 2022-2023 投票"
              ]
            ]
          },
          {
            "range": "'設定'!B11",
            "majorDimension": "ROWS",
            "values": [
              [
                "今年も\u003ca href=\"https://arcane.com/ja-jp/\" target=\"_blank\"\u003eCOUNTDOWN CAOFF\u003c/a\u003eが12月31日に開催されます。\u003cbr/\u003e\nそこで、2022年に発表されたアニソンの中で皆さんが良かったと思う曲ベスト10を決めたいと思います!!"
              ]
            ]
          },
          {
            "range": "'設定'!B14",
            "majorDimension": "ROWS",
            "values": [
              [
                "caoff2023"
              ]
            ]
          },
          {
            "range": "'設定'!B17",
            "majorDimension": "ROWS",
            "values": [
              [
                "2021年度"
              ]
            ]
          }
        ]
      }
    }
    const expectedSongsResult = {
      data: {
        "range": "'2022年度'!A1:B5",
        "majorDimension": "ROWS",
        "values": [
          ["title", "Artist",  "タイアップ"],
          ["曲名1", "歌手1", "アニメタイトル1"],
          ["曲名2", "歌手2", "アニメタイトル2"],
          ["曲名3", "歌手3", "アニメタイトル3"],
          ["曲名4", "歌手4", "アニメタイトル4"]
        ]
      }
    }
    const expectedBody = {
      "title": "COUNT DOWN CAOFF 2022-2023 投票",
      "body": "今年も\u003ca href=\"https://arcane.com/ja-jp/\" target=\"_blank\"\u003eCOUNTDOWN CAOFF\u003c/a\u003eが12月31日に開催されます。\u003cbr/\u003e\nそこで、2022年に発表されたアニソンの中で皆さんが良かったと思う曲ベスト10を決めたいと思います!!",
      "hashtag": "caoff2023",
      "songs": [
        { songTitle: "曲名1", artist: "歌手1", animeTitle: "アニメタイトル1", id: 0 },
        { songTitle: "曲名2", artist: "歌手2", animeTitle: "アニメタイトル2", id: 1 },
        { songTitle: "曲名3", artist: "歌手3", animeTitle: "アニメタイトル3", id: 2 },
        { songTitle: "曲名4", artist: "歌手4", animeTitle: "アニメタイトル4", id: 3 }
      ]
    }
    sandbox.stub(process.env, 'SPREADSHEET_ID').value('spid')
    sandbox.stub(process.env, 'SPREADSHEET_APP_KEY').value('12345')
    const axiosStub = sandbox.stub(axios, 'get')
    axiosStub.withArgs('https://sheets.googleapis.com/v4/spreadsheets/spid/values:batchGet', sinon.match.object).returns(expectedSettingResult)
    axiosStub.withArgs('https://sheets.googleapis.com/v4/spreadsheets/spid/values/2021年度!A:C', sinon.match.object).returns(expectedSongsResult)
    const result = await target.handler(event, context)
    assert.deepEqual({
      statusCode: '200',
      body: JSON.stringify(expectedBody),
      headers: { 'Content-Type': 'application/json' }
    }, result)
  })

  it('異常系', async () => {
    sandbox.stub(process.env, 'SPREADSHEET_ID').value('spid')
    sandbox.stub(process.env, 'SPREADSHEET_APP_KEY').value('12345')
    const axiosStub = sandbox.stub(axios, 'get')
    axiosStub.throws(new Error('get fail'))
    const result = await target.handler(event, context)
    assert.deepEqual({
      statusCode: '500',
      body: JSON.stringify({message: "get fail"}),
      headers: { 'Content-Type': 'application/json' }
    }, result)
  })

  afterEach(function () {
    sandbox.restore()
  })
})