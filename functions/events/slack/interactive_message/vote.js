const lib = require('lib')({ token: process.env.STDLIB_SECRET_TOKEN });

const { createPoll } = require('../../../../helpers');

/**
* An HTTP endpoint that acts as a webhook for Slack interactive_message event
* @param {object} event Slack interactive_message event body (raw)
* @returns {any}
*/
module.exports = async event => {
  let [pollId, choice] = event.actions.find(action => action.name === 'vote').value.split('|');

  let previousVote = await lib.airtable.query['@0.3.2']
    .select({
      table: 'Votes',
      where: [
        {
          Poll__contains: pollId,
          'User Id': event.user.id
        }
      ]
    })
    .then(results => results.rows.pop());

  if (previousVote) {
    await lib.airtable.query['@0.3.2'].update({
      table: 'Votes',
      where: [
        {
          Id: previousVote.fields.Id
        }
      ],
      fields: {
        Choice: choice
      }
    });
  } else {
    await lib.airtable.query['@0.3.2'].insert({
      table: 'Votes',
      fields: {
        Poll: [pollId],
        'User Id': event.user.id,
        Choice: choice
      }
    });
  }

  let poll = await lib.airtable.query['@0.3.2']
    .select({
      table: 'Polls',
      where: [{ Id: pollId }]
    })
    .then(results => results.rows.pop());

  let votes = await lib.airtable.query['@0.3.2']
    .select({
      table: 'Votes',
      where: [
        {
          Poll__contains: pollId
        }
      ]
    })
    .then(results => results.rows);

  let options = poll.fields.Options.split('|').map((option, index) => {
    return {
      text: option,
      votes: votes.filter(vote => parseInt(vote.fields.Choice) === index + 1).length
    };
  });

  await lib.slack.messages['@0.5.1'].update({
    id: poll.fields['Channel Id'],
    ts: poll.fields['Message Timestamp'],
    attachments: createPoll({
      name: poll.fields.Name,
      creator: poll.fields['Creator Id'],
      options: options,
      pollId: poll.fields.Id
    })
  });

  return;
};
