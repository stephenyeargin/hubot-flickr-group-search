const path = require('path');
const { Robot, TextMessage } = require('hubot');
const nock = require('nock');

class TestBotContext {
  constructor(robot, user) {
    this.robot = robot; this.user = user;
    this.sends = []; this.replies = [];
    this.robot.adapter.on('send', (_, strings) => this.sends.push(strings.join('\n')));
    this.robot.adapter.on('reply', (_, strings) => this.replies.push(strings.join('\n')));
    this.nock = nock;
  }

  async send(message) {
    const id = (Math.random() + 1).toString(36).substring(7);
    this.robot.adapter.receive(new TextMessage(this.user, message, id));
    await new Promise((done) => { setTimeout(done, 50); });
  }

  async sendAndWaitForResponse(message, responseType = 'send') {
    return new Promise((done) => {
      this.robot.adapter.once(responseType, (_, strings) => done(strings[0]));
      this.send(message);
    });
  }

  shutdown() {
    delete process.env.HUBOT_FLICKR_API_KEY;
    delete process.env.HUBOT_FLICKR_GROUP_ID;
    nock.cleanAll();
    this.robot.shutdown();
  }
}

async function createTestBot(settings = {}) {
  process.env.HUBOT_LOG_LEVEL = 'silent';
  process.env.HUBOT_FLICKR_API_KEY = 'test_api_key';
  process.env.HUBOT_FLICKR_GROUP_ID = 'test_group_id';
  nock.cleanAll();
  nock.disableNetConnect();
  // Require after env vars are set so flickr-sdk initializes with the API key
  const scriptPath = require.resolve('../../src/flickr-group-search');
  delete require.cache[scriptPath];
  // Also clear flickr-sdk from cache so it re-reads the env var
  Object.keys(require.cache)
    .filter((k) => k.includes('flickr-sdk'))
    .forEach((k) => { delete require.cache[k]; });
  const script = require(scriptPath); // eslint-disable-line import/no-dynamic-require, global-require
  const robot = new Robot(path.resolve(__dirname, 'adapter'), false, 'hubot');
  await robot.loadAdapter(path.resolve(__dirname, 'adapter.js'));
  script(robot);
  return new Promise((done) => {
    robot.adapter.on('connected', () => {
      if (settings.adapterName) robot.adapterName = settings.adapterName;
      const user = robot.brain.userForId('1', { name: 'testuser', room: '#testroom' });
      done(new TestBotContext(robot, user));
    });
    robot.run();
  });
}

module.exports = { createTestBot, TestBotContext };
