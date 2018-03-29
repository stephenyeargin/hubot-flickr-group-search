Helper = require('hubot-test-helper')
chai = require 'chai'
nock = require 'nock'

expect = chai.expect

helper = new Helper [
  '../src/flickr-group-search.coffee'
]

describe 'hubot-flickr-group-search', ->
  beforeEach ->
    process.env.HUBOT_LOG_LEVEL='error'
    process.env.HUBOT_FLICKR_GROUP_ID='00000@000'
    process.env.HUBOT_FLICKR_API_KEY='foo123bar'
    nock.disableNetConnect()
    @room = helper.createRoom()

  afterEach ->
    delete process.env.HUBOT_LOG_LEVEL
    delete process.env.HUBOT_FLICKR_GROUP_ID
    delete process.env.HUBOT_FLICKR_API_KEY
    nock.cleanAll()
    @room.destroy()

  it 'retrieves photos matching a query', (done) ->
    nock('https://api.flickr.com')
      .get('/services/rest')
      .query(true)
      .replyWithFile(200, __dirname + '/fixtures/photos.search.json')

    selfRoom = @room
    selfRoom.user.say('alice', '@hubot photos dogs')
    setTimeout(() ->
      try
        expect(selfRoom.messages).to.eql [
          ['alice', '@hubot photos dogs']
          ['hubot', '@alice Retrieving photos matching: "dogs"']
          ['hubot', '@alice There are 142 photos in the group that match your search. Here are the 5 most recent:'],
          ['hubot', '- https://flickr.com/photos/135188764@N04/36155994663 - R0015531 - dog with hat\n- https://flickr.com/photos/91210007@N06/26967112975 - Hot Diggity Dog Hot Dog place\n- https://flickr.com/photos/123677698@N03/26284057513 - Dog In The Middle\n- https://flickr.com/photos/82879511@N00/11227992813 - Hot Dogs\n- https://flickr.com/photos/23128100@N00/8367619593 - girl in tub']
        ]
        done()
      catch err
        done err
      return
    , 1000)
