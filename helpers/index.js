const NUM_EMOJI = {
  1: ':one:',
  2: ':two:',
  3: ':three:',
  4: ':four:',
  5: ':five:',
  6: ':six:',
  7: ':seven:',
  8: ':eight:',
  9: ':nine:',
  10: ':keycap_ten:'
};

function createButton (index, pullId) {
  return {
    name: 'vote',
    text: NUM_EMOJI[index + 1],
    type: 'button',
    value: `${pullId}|${(index + 1).toString()}`
  };
}

function createPoll ({ name, creator, options, pollId }) {
  let text = [
    `*${name}* Poll by <@${creator}>`,
    ...options.map(
      (option, index) => `${NUM_EMOJI[index + 1]} ${option.text} | ${option.votes} votes`
    )
  ].join('\n\n');

  return [
    {
      text: text,
      fallback: `*${name}* Poll by <@${creator}>`,
      callback_id: 'vote',
      color: '#3AA3E3',
      attachment_type: 'default',
      actions: options.map((_, index) => createButton(index, pollId))
    }
  ];
}

module.exports = {
  createPoll
};
