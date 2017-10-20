var emojiCodes = {
    ':D': '😃',
    ':)': '🙂',
    ';)': '😉',
    ':|': '😐',
    ':thinking:': '🤔',
    ':P': '😛',
    ';P': '😜',
    '-_-': '😒',
    ':/': '😕',
    ':(': '🙁',
    'XD': '😆',
    'D:': '😦',
    '>:(': '😡',
    '>:)': '😈',
    ':poop:': '💩',
    ':3': '😺'
};


module.exports = {
    convertEmojis: function(message){
    var splitMsg = message.split(" ");
    for (var x = 0; x < splitMsg.length; x++) {
        if (splitMsg[x] in emojiCodes) {
            splitMsg[x] = emojiCodes[splitMsg[x]];
        }
    }
    return splitMsg.join(' ');
    }
};