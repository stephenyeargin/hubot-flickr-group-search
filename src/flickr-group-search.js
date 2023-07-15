// Description
//   Search a specified Flickr group for photos.
//
// Configuration:
//   HUBOT_FLICKR_API_KEY - API key
//   HUBOT_FLICKR_GROUP_ID - Group ID to search
//
// Commands:
//   hubot photos <term> - Search for a particular search term in the group
//
// Author:
//   stephenyeargin

const _ = require('lodash');
const Flickr = require('flickr-sdk');

// Configure the library
const flickr = new Flickr(process.env.HUBOT_FLICKR_API_KEY);

module.exports = function(robot) {
  let missingEnvironmentForApi;
  const flickrGroupId = process.env.HUBOT_FLICKR_GROUP_ID;

  robot.respond(/(?:photo|photos) (.*)/i, function(msg) {
    if (missingEnvironmentForApi(msg)) {
      return;
    }

    msg.reply(`Retrieving photos matching: \"${msg.match[1]}\"`);
    // Making the request from Flickr
    return flickr.photos.search({
      text: msg.match[1],
      page: 1,
      per_page: 5,
      group_id: flickrGroupId,
      media: 'photos',
      sort: 'date-taken-desc'
    })
    .then((response) => {
      const attachments = [];
      const irc_list = [];

      const results = JSON.parse(response.text);

      // Malformed response
      if (results.photos == null) {
        return msg.send("Empty response from API.");
      }

      // Put together the count summary
      const count = results.photos.photo.length;
      if (count === 0) {
        return msg.send("No photos found. :cry:");
      }

      const summary = `There are ${results.photos.total} photos in the group that match your search. Here are the ${count} most recent:`;

      // Loop through the response
      _(results.photos.photo).each(function(photo, i) {
        // Piece together from the photos
        const photo_src = `https://c1.staticflickr.com/${photo.farm}/${photo.server}/${photo.id}_${photo.secret}_b.jpg`;
        const photo_url = `https://flickr.com/photos/${photo.owner}/${photo.id}`;

        // Slack attachments
        attachments.push({
          title: photo.title,
          title_link: photo_url,
          image_url: photo_src,
          author_name: "Flickr",
          author_link: `https://flickr.com/groups/${flickrGroupId}`,
          author_icon: "https://s.yimg.com/pw/images/goodies/white-large-chiclet.png"
        });

        // Non-slack content
        return irc_list.push(`- ${photo_url} - ${photo.title}`);
      });

      // Send the message
      switch (robot.adapterName) {
        case 'slack':
          var payload = {
            text: summary,
            fallback: summary + "\n" + irc_list.join("\n"),
            attachments,
            unfurl_links: false
          };
          return msg.send(payload);
        // Non-slack response
        default:
          msg.reply(summary);
          return msg.send(irc_list.join("\n"));
      }

    }).catch((err) => {
      msg.reply("Sorry, unable to retrieve photos. :cry:");
      robot.logger.error(err);
    });
  });

  // Check for required config
  return missingEnvironmentForApi = function(msg) {
    let missingAnything = false;
    if (process.env.HUBOT_FLICKR_API_KEY == null) {
      msg.send("Flickr API Key is missing: Ensure that HUBOT_FLICKR_API_KEY is set.");
      missingAnything |= true;
    }
    if (process.env.HUBOT_FLICKR_GROUP_ID == null) {
      msg.send("Flickr Group ID is missing: Ensure that HUBOT_FLICKR_GROUP_ID is set.");
      missingAnything |= true;
    }
    return missingAnything;
  };
};
