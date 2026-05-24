const {
  describe, it, beforeEach, afterEach,
} = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const nock = require('nock');
const { createTestBot } = require('./common/TestBot');

describe('hubot-flickr-group-search for slack', () => {
  let bot;

  beforeEach(async () => {
    bot = await createTestBot({ adapterName: 'slack' });
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

    const payload = sends[0];
    assert.equal(typeof payload, 'object');
    assert.match(payload.text, /There are 142 photos in the group that match your search\. Here are the 5 most recent:/);
    assert.match(payload.fallback, /There are 142 photos in the group that match your search\./);
    assert.match(payload.fallback, /https:\/\/flickr\.com\/photos\/135188764@N04\/36155994663 - R0015531 - dog with hat/);
    assert.equal(payload.unfurl_links, false);
    assert.equal(payload.attachments.length, 5);

    const firstAttachment = payload.attachments[0];
    assert.equal(firstAttachment.title, 'R0015531 - dog with hat');
    assert.equal(firstAttachment.title_link, 'https://flickr.com/photos/135188764@N04/36155994663');
    assert.equal(firstAttachment.image_url, 'https://c1.staticflickr.com/5/4380/36155994663_668de89232_b.jpg');
    assert.equal(firstAttachment.author_name, 'Flickr');
    assert.equal(firstAttachment.author_link, `https://flickr.com/groups/${process.env.HUBOT_FLICKR_GROUP_ID || 'test_group_id'}`);
    assert.equal(firstAttachment.author_icon, 'https://s.yimg.com/pw/images/goodies/white-large-chiclet.png');
  });
});
