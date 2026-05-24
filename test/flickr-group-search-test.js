const {
  describe, it, beforeEach, afterEach,
} = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const nock = require('nock');
const { createTestBot } = require('./common/TestBot');

describe('hubot-flickr-group-search', () => {
  let bot;

  beforeEach(async () => {
    bot = await createTestBot();
  });

  afterEach(() => {
    bot.shutdown();
  });

  it('retrieves photos matching a query', async () => {
    nock('https://api.flickr.com')
      .get('/services/rest')
      .query(true)
      .replyWithFile(200, path.join(__dirname, 'fixtures/photos.search.json'));

    const replies = [];
    const sends = [];

    await new Promise((resolve) => {
      bot.robot.adapter.on('reply', (_, strings) => replies.push(strings[0]));
      bot.robot.adapter.on('send', (_, strings) => {
        sends.push(strings[0]);
        resolve();
      });
      bot.send('hubot photos dogs');
      setTimeout(resolve, 1500);
    });

    assert.equal(replies[0], 'Retrieving photos matching: "dogs"');
    assert.match(replies[1], /There are 142 photos in the group that match your search\. Here are the 5 most recent:/);
    assert.match(sends[0], /https:\/\/flickr\.com\/photos\/135188764@N04\/36155994663 - R0015531 - dog with hat/);
    assert.match(sends[0], /https:\/\/flickr\.com\/photos\/91210007@N06\/26967112975 - Hot Diggity Dog Hot Dog place/);
    assert.match(sends[0], /https:\/\/flickr\.com\/photos\/123677698@N03\/26284057513 - Dog In The Middle/);
    assert.match(sends[0], /https:\/\/flickr\.com\/photos\/82879511@N00\/11227992813 - Hot Dogs/);
    assert.match(sends[0], /https:\/\/flickr\.com\/photos\/23128100@N00\/8367619593 - girl in tub/);
  });
});
