Helper = require('hubot-test-helper')
chai = require 'chai'

expect = chai.expect

helper = new Helper('../src/flickr-group-search.coffee')

describe 'flickr-group-search', ->
  beforeEach ->
    @room = helper.createRoom()
    process.env.HUBOT_FLICKR_GROUP_ID = '00000'
    process.env.HUBOT_FLICKR_API_KEY = 'foo123bar'
    process.env.HUBOT_FLICKR_API_SECRET = 'sekret'

  afterEach ->
    @room.destroy()

  it 'responds to photos', ->
    @room.user.say('alice', '@hubot photos dogs').then =>
      expect(@room.messages).to.eql [
        ['alice', '@hubot photos dogs']
        ['hubot', '@alice Retrieving photos matching: "dogs"']
      ]
