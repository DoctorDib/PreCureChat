var USERNAME = '';

var className = '';


var audio = new Audio('./sound/notification.mp3');


var user = '';


var lastCacheMsg = '';

var reType = false;
var messageSend = {};



var timeout;




var activeSession = false;
var inactiveMessageCount = 0;

jQuery(window).blur(function(){
    activeSession = false;
});
jQuery(window).focus(function(){
    activeSession = true;
    document.title = 'Precure chat';
    inactiveMessageCount = 0;
});



var submit = function() {
    var socket = io();
    USERNAME = document.getElementById('launcherInput').value;
    className = USERNAME.replace(/\s/g, '_');
    socket.emit('username', USERNAME);
    user = USERNAME;
    if(USERNAME !== ''){
        var disp = jQuery('#launcher')[0]

        disp.style.display = "none"
    } else {
        alert('Please enter your username!');
    }
}




jQuery(function () {
    var socket = io();
    var SPACE = "=!837569375asdf43qw4fr5ge5t6se45rtg4g5e4g6: ";

    jQuery('form').submit(function(){
        messageSend = {};
        socket.emit('chat message', reType + SPACE + USERNAME  + SPACE + className + SPACE + jQuery('#m').val());

        lastCacheMsg = jQuery('#m').val();

        $('#right').scrollTop($('#right')[0].scrollHeight);

        jQuery('#m').val('');
        return false;
    });



    socket.on('chat message', function(msg){


        var message = msg.split('=!837569375asdf43qw4fr5ge5t6se45rtg4g5e4g6: ');

        var boolRetype = message[0];
        var userName = message[1]
        var className = message[2]
        message = message[3]


        if(activeSession === false){
            inactiveMessageCount += 1;
            document.title = inactiveMessageCount;
            audio.play();
        }


        var img = message.split('.').pop();
        if(jQuery.inArray(img, ["gif", "jpg", "jpeg", "png"]) !== -1){
            console.log(img);
            if(user === userName){
                jQuery('#messages').append(jQuery('<li id="senderImg">').append(jQuery('<img src="' + message + '" alt="sent by ' + userName + '" />')))
            } else {
                jQuery('#messages').append(jQuery('<li id="recieverImg">').append(jQuery('<p>').html(userName.bold() + ':')).append(jQuery('<img src="' + message + '" alt="sent by ' + userName + '" />')));
            }
        } else {
            if (boolRetype === 'true') {
                if (user === userName) {
                    jQuery('#messages li#sender:last')[0].innerHTML = message;
                } else {
                    jQuery('#messages li#reciever.' + className + ':last')[0].innerHTML = userName.bold() + ": " + message;
                }
                reType = false;
            } else {
                if (user === userName) {
                    jQuery('#messages').append($('<li id="sender" class="' + className + '">').text(message));
                } else {
                    jQuery('#messages').append($('<li id="reciever" class="' + className + '">').html(userName.bold() + ": " + message));
                }
            }
        }


            $('#right').scrollTop($('#right')[0].scrollHeight);

    });

    socket.on('people', function(msg){

        var numberOfPeople = msg.split(' == = == ')[1];
        var listOfPeople = msg.split(' == = == ')[0];

        listOfPeople = listOfPeople.split(',')

        jQuery('.Remove').remove();

        for(np = 0; np<listOfPeople.length; np++){
            jQuery('#listedPeople').append($('<li class="Remove">').text("- " + listOfPeople[np]));
        }


        jQuery('#numofPeople')[0].innerHTML = 'Current Online: ' + numberOfPeople;


        console.log(jQuery('#numofPeople')[0].innerHTML)
    });


    function timeoutFunction() {
        typing = false;
        socket.emit("typing", false);
    }


    jQuery('#m').keyup(function() {
        typing = true;
        socket.emit('typing', USERNAME + ' is typing...');
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 2000);
    });


    socket.on('typing', function(data) {
        if (data && data.split(' ')[0] !== USERNAME) {
            jQuery('.typing').html(data);
        } else {
            jQuery('.typing').html("");
        }
    });


});





jQuery.fn.putCursorAtEnd = function() {
    return this.each(function() {
        var $el = $(this),
        el = this;
        if (!$el.is(":focus")) {
            $el.focus();
        }
        if (el.setSelectionRange) {
            var len = $el.val().length * 2;
            setTimeout(function() {
                el.setSelectionRange(len, len);
            }, 1);
        } else {
            $el.val($el.val());
        }
        this.scrollTop = 999999;
    });
};




$(document).keydown(function(e) {
    if(e.which === 38) {
        jQuery('#m')[0].value = lastCacheMsg;
        reType = true;

        $('#m').putCursorAtEnd();
    } else if(e.which === 13 && jQuery('#launcher')[0].style.display !== 'none'){
        submit();
        jQuery('#m').focus();
    }
});

window.setTimeout(function(){
    jQuery('#launcherInput').focus();
}, 250);




