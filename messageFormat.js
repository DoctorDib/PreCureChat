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

var formattingCodes = {
    '*': ['<b>', '</b>'],
    '//': ['<i>', '</i>'],
    '--': ['<del>', '</del>'],
    '_': ['<ins>', '</ins>'],
    '^': ['<sup>', '</sup>']
};

//var markdown = require( "markdown" ).markdown;
var emoji = require('node-emoji');

module.exports = {
    parseMessage: function(message){
        //var finalMessage = parseEmojis(message);
        var finalMessage = emoji.emojify(message);
        finalMessage = parseEmojis(finalMessage);
        finalMessage = removeTags(finalMessage);
        finalMessage = parseFormatting(finalMessage);

        return finalMessage;
    }
};

function parseEmojis(message){
    var splitMsg = message.split(" ");
    for (var x = 0; x < splitMsg.length; x++) {
        if (splitMsg[x] in emojiCodes) {
            splitMsg[x] = emojiCodes[splitMsg[x]];
        }
    }
    return splitMsg.join(' ');
}

function removeTags(message){
    return message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function parseFormatting(message){
    var returnMsg = message;
    Object.keys(formattingCodes).forEach(function(key, index){
        var msg = returnMsg.split(key);
        if(msg.length > 2){
            for(var i = 1; i <= msg.length-1; i +=2){
                msg[i] = formattingCodes[key][0] + msg[i] + formattingCodes[key][1];
            }
            returnMsg = msg.join(' ');
        }
    });
    return returnMsg;
}