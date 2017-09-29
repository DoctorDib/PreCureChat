// USERNAME - To identify the sender.
// className - Slugified version of USERNAME (Each user has their own class when sending a message)
// user - Helps identify if the message was sent from the sender.
var USERNAME = '';
var className = '';
var user = '';


// lastCacheMsh - Always holds the latest up-to-date message. 
var lastCacheMsg = '';


// reTyep - will set when the user clicks up arrow.
var reType = false;


var timeout;

// Inactive session boolean.
var activeSession = true;
// counts how many missed messages and places value into tab title.
var inactiveMessageCount = 0;
// Changable notification sound.
var audio = new Audio('./sound/notification.mp3');


// .blur and .focus will detect if your current active window is the chatroom.
// Clicked off screen.
jQuery(window).blur(function(){
    activeSession = false;
});
// Clicked on screen.
jQuery(window).focus(function(){
    activeSession = true;
    document.title = 'Precure chat';
    inactiveMessageCount = 0;
});


// FIRST TIME LAUNCHER  - submit() will run once the launcher button has been clicked.
var submit = function() {
    var socket = io();
    USERNAME = document.getElementById('launcherInput').value;
    // className slugifies USERNAME
    className = USERNAME.replace(/\s/g, '_');
    socket.emit('username', USERNAME);
    user = USERNAME;
    if(USERNAME.replace(/\s/g, '') !== ''){
        var disp = jQuery('#launcher')[0]
        disp.style.display = "none"
    } else {
        alert('Please enter your username!');
    }
}



jQuery(function () {
    var socket = io();
    // A unique value that no user will accidentally type. (1/1000000000000 chance(Probably more))
    var SPACE = "=!837569375asdf43qw4fr5ge5t6se45rtg4g5e4g6: ";

    // Sends current value in input box to the server.
    jQuery('form').submit(function(){
        //reType - Whether they are editing their previous message.
        // USERNAME - The users name tag.
        // className - the slugified name of USERNAME to help identify when editting personal message.
        // jQuery('#m').val() - The message.
        socket.emit('chat message', reType + SPACE + USERNAME  + SPACE + className + SPACE + jQuery('#m').val());

        lastCacheMsg = jQuery('#m').val();

        $('#right').scrollTop($('#right')[0].scrollHeight);

        jQuery('#m').val('');
        return false;
    });


    // Recieving message from server.
    socket.on('chat message', function(msg){
        // Collects data by splitting at space.
        var message = msg.split(SPACE);

        var boolRetype = message[0];
        var userName = message[1]
        var className = message[2]
        message = message[3]

        // When recieveing message, it will check whether current chatroom is active.
        if(activeSession === false){
            inactiveMessageCount += 1;
            document.title = inactiveMessageCount;
            audio.play();
        }

        // splits to check if the last value is one of the below image/gif formats.
        var img = message.split('.').pop();
        // First checks whether it's an image or not.
        if(jQuery.inArray(img, ["gif", "jpg", "jpeg", "png"]) !== -1){
            console.log(img);
            if(user === userName){
                jQuery('#messages').append(jQuery('<li id="senderImg">').append(jQuery('<img src="' + message + '" alt="sent by ' + userName + '" />')))
            } else {
                jQuery('#messages').append(jQuery('<li id="recieverImg">').append(jQuery('<p>').html(userName.bold() + ':')).append(jQuery('<img src="' + message + '" alt="sent by ' + userName + '" />')));
            }
        } else {
            // Retyping the message either from sender or reciever.
            if (boolRetype === 'true') {
                if (user === userName) {
                    jQuery('#messages li#sender:last')[0].innerHTML = message;
                } else {
                    jQuery('#messages li#reciever.' + className + ':last')[0].innerHTML = userName.bold() + ": " + message;
                }
                reType = false;
            } else {
                // Default message send.
                if (user === userName) {
                    jQuery('#messages').append($('<li id="sender" class="' + className + '">').text(message));
                } else {
                    jQuery('#messages').append($('<li id="reciever" class="' + className + '">').html(userName.bold() + ": " + message));
                }
            }
        }

            $('#messages').scrollTop($('#messages')[0].scrollHeight);

    });

    // This function is list every active user in session to the left hand side.
    socket.on('people', function(msg){

        var numberOfPeople = msg.split(' == = == ')[1];
        var listOfPeople = msg.split(' == = == ')[0];

        listOfPeople = listOfPeople.split(',')

        jQuery('.Remove').remove();

        for(np = 0; np<listOfPeople.length; np++){
            jQuery('#listedPeople').append($('<li class="Remove">').text(listOfPeople[np]));
        }

        jQuery('#numofPeople')[0].innerHTML = 'Current Online: ' + numberOfPeople;

        console.log(jQuery('#numofPeople')[0].innerHTML)
    });

    // typing will change depending on whether you're typing.
    function timeoutFunction() {
        typing = false;
        socket.emit("typing", false);
    }

    // [USERNAME] is typing... 
    // Sets value to check if you're typing.
    jQuery('#m').keyup(function() {
        typing = true;
        socket.emit('typing', USERNAME + ' is typing...');
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 2000);
    });


    // Will input the data into a <P> tag.    
    socket.on('typing', function(data) {
        if (data && data.split(' ')[0] !== USERNAME) {
            jQuery('.typing').html(data);
        } else {
            jQuery('.typing').html("");
        }
    });


});



// Function taken from the net - Places your cursor at the end of the sentence.
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



// EDIT PREVIOUS MESSAGE
$(document).keydown(function(e) {
    // Key 38 - Up arrow
    if(e.which === 38) {
        // inputs lastCacheMsh into input box.
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




