# Hubot Flickr Group Search

[![npm version](https://badge.fury.io/js/hubot-flickr-group-search.svg)](http://badge.fury.io/js/hubot-flickr-group-search) [![Node CI](https://github.com/stephenyeargin/hubot-flickr-group-search/actions/workflows/nodejs.yml/badge.svg)](https://github.com/stephenyeargin/hubot-flickr-group-search/actions/workflows/nodejs.yml)

Search a specified Flickr group for photos.

## Installation

In hubot project repo, run:

`npm install hubot-flickr-group-search --save`

Then add **hubot-flickr-group-search** to your `external-scripts.json`:

```json
[
  "hubot-flickr-group-search"
]
```

## Configuration Values

| Environment Variable  | Required? | Description                              |
| --------------------- | :-------: | ---------------------------------------- |
| HUBOT_FLICKR_API_KEY  | Yes       | API key (registered with Flickr)         |
| HUBOT_FLICKR_GROUP_ID | Yes       | Group ID to search; Found as "recent groups" on API page |

## Sample Interaction

### Slack

![screen shot 2017-01-11 at 9 34 19 pm](https://cloud.githubusercontent.com/assets/80459/21876058/ccbff0e0-d845-11e6-8a7e-6218853f69a0.png)

### IRC / Hipchat

```
user1>> hubot photos hotdog
hubot>>  There are 8 photos in the group that match your search. Here are the 5 most recent:
hubot>>  - https://flickr.com/photos/82879511@N00/6826087915 - printers alley
hubot>>  - https://flickr.com/photos/49731395@N03/5684840654 - The Real Dog of Nashville
hubot>>  - https://flickr.com/photos/28363118@N00/5597090456 - 4/6/2011 / 365
hubot>>  - https://flickr.com/photos/28363118@N00/5541370289 - I Dream Of Weenie
hubot>>  - https://flickr.com/photos/30269559@N04/5031751851 - .mmmm fair food
```

## NPM Module

https://www.npmjs.com/package/hubot-flickr-group-search
