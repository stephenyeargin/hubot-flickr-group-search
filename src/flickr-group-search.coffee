# Description
#   Search a specified Flickr group for photos.
#
# Configuration:
#   HUBOT_FLICKR_API_KEY - API key
#   HUBOT_FLICKR_GROUP_ID - Group ID to search
#
# Commands:
#   hubot photos <term> - Search for a particular search term in the group
#
# Author:
#   Stephen Yeargin <stephen.yeargin@gmail.com>

_ = require 'lodash'
Flickr = require 'flickr-sdk'

# Configure the library
flickr = new Flickr(process.env.HUBOT_FLICKR_API_KEY)

module.exports = (robot) ->
  isSlack = robot.adapterName == 'slack'

  robot.respond /(?:photo|photos) (.*)/i, (msg) ->
    if missingEnvironmentForApi(msg)
      return

    msg.reply "Retrieving photos matching: \"#{msg.match[1]}\""
    # Making the request from Flickr
    flickr.photos.search(
        text: msg.match[1]
        page: 1,
        per_page: 5,
        group_id: process.env.HUBOT_FLICKR_GROUP_ID,
        media: 'photos'
        sort: 'date-taken-desc'
      )
      .then ((response) ->
        attachments = []
        irc_list = []

        results = JSON.parse(response.text)

        # Malformed response
        unless results.photos?
          return msg.send "Empty response from API."

        # Put together the count summary
        count = results.photos.photo.length
        if count == 0
          return msg.send "No photos found. :cry:"

        summary = "There are #{results.photos.total} photos in the group that match your search. Here are the #{count} most recent:"

        # Loop through the response
        _(results.photos.photo).each (photo, i) ->
          # Piece together from the photos
          photo_src = "https://c1.staticflickr.com/#{photo.farm}/#{photo.server}/#{photo.id}_#{photo.secret}_b.jpg"
          photo_url = "https://flickr.com/photos/#{photo.owner}/#{photo.id}"

          # Slack attachments
          attachments.push {
            title: photo.title,
            title_link: photo_url,
            image_url: photo_src,
            author_name: "Flickr",
            author_link: "https://flickr.com/groups/#{process.env.HUBOT_FLICKR_GROUP_ID}",
            author_icon: "https://s.yimg.com/pw/images/goodies/white-large-chiclet.png"
          }

          # Non-slack content
          irc_list.push "- #{photo_url} - #{photo.title}"

        # Send the message
        if isSlack
          payload = {
            text: summary,
            fallback: summary + "\n" + irc_list.join("\n"),
            attachments: attachments,
            unfurl_links: false
          }
          msg.send payload
        # Non-slack response
        else
          msg.reply summary
          msg.send irc_list.join("\n")

      )
      .catch (err) ->
        msg.reply "Sorry, unable to retrieve photos. :cry:"
        robot.logger.error err

  # Check for required config
  missingEnvironmentForApi = (msg) ->
    missingAnything = false
    unless process.env.HUBOT_FLICKR_API_KEY?
      msg.send "Flickr API Key is missing: Ensure that HUBOT_FLICKR_API_KEY is set."
      missingAnything |= true
    unless process.env.HUBOT_FLICKR_GROUP_ID?
      msg.send "Flickr Group ID is missing: Ensure that HUBOT_FLICKR_GROUP_ID is set."
      missingAnything |= true
    missingAnything
