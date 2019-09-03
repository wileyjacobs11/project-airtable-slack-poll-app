const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

const { createPoll } = require('../../../../helpers');

/**
* An HTTP endpoint that acts as a webhook for Slack command event
* @param {object} event Slack command event body (raw)
* @returns {any}
*/
module.exports = async event => {
  let [name, ...options] = event.text
    .match(/"([^"]*)"/g) // Match all double quoted text
    .map(s => s.slice(1, -1)); // Trim the double quotes off

  let poll = await lib.airtable.query['@0.3.2'].insert({
    table: `Polls`,
    fields: {
      Name: name,
      'Creator Id': event.user_id,
      'Channel Id': event.channel_id,
      Options: options.join('|')
    }
  });

  let { ts } = await lib.slack.messages['@0.5.1'].create({
    id: event.channel_id,
    as_user: false,
    attachments: createPoll({
      name: name,
      creator: event.user_id,
      options: options.map(option => {
        return {
          text: option,
          votes: 0
        };
      }),
      pollId: poll.fields.Id
    })
  });

  await lib.airtable.query['@0.3.2'].update({
    table: 'Polls',
    where: [
      {
        Id: poll.fields.Id
      }
    ],
    fields: {
      'Message Timestamp': ts
    }
  });

  return;
};
