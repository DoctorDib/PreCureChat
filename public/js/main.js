// USERNAME - To identify the sender.
// className - Slugified version of USERNAME (Each user has their own class when sending a message)
// user - Helps identify if the message was sent from the sender.
var USERNAME = '';
var className = '';
var user = '';

var message = {};

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
var notifSound = new Audio('./sound/NewMessage.mp3');
var loggedIn = false;
var loginSocket = io('/login');

var checkCookie = function (token){

    try {
        var cookies = token.split('---');

        var cookies_obj = {
            token: cookies[0].split('=')[1],
            expiry: cookies[1].split('=')[1]
        };


        return cookies_obj;
    } catch(err){
        return false;
    }
};

// MAKE IT DETECT IF COOKIE
var token = checkCookie(document.cookie);

function tokenCheck(){
    if(token !== false){
        loginSocket.emit('tokenLogin', token);
    }
}

tokenCheck();

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
var submit = function(uData) {
    var socket = io();
    USERNAME = uData.uName;//document.getElementById('launcherInput').value;
    token = {
        token: uData.token,
        expiry: uData.tokenExpire
    };
    document.cookie = 'token=' + token.token + '--- expires=' + token.expiry + ';';
    // className slugifies USERNAME
    className = uData.uID;//.replace(/\s/g, '_');
    socket.emit('username', USERNAME);
    user = USERNAME;
    if(USERNAME !== ''){
        var disp = jQuery('#launcher')[0];
        disp.style.display = "none";
        setTimeout(function(){
            loggedIn = true;
            socket.emit('login', USERNAME);


            }, 100);
        loggedInTime();
        //loggedIn = true;
    } else {
        alert('Please enter your username!');
    }
};



//jQuery(function () {
var loggedInTime = function(){
    var socket = io();
    // A unique value that no user will accidentally type. (1/1000000000000 chance(Probably more))
    var usersTyping = [];

    // Sends current value in input box to the server.
    jQuery('#messageInput').submit(function(){
        //reType - Whether they are editing their previous message.
        // USERNAME - The users name tag.
        // className - the slugified name of USERNAME to help identify when editting personal message.
        // jQuery('#m').val() - The message.
            message = {edit: reType, user: USERNAME, classN: className, msg: jQuery('#m').val()};

        if(loggedIn) {
            socket.emit('chat message', message);
            timeoutFunction();
        }

            lastCacheMsg = jQuery('#m').val();

            $('#messages').scrollTop($('#messages')[0].scrollHeight);

            jQuery('#m').val('');
            return false;
    });

    socket.on('login', function(user){
        if(user !== USERNAME){
            var msgTag = document.createElement('div');
            msgTag.id = 'messageTag';
            msgTag.innerHTML = user + ' has logged in!';
            jQuery('#messages').append($('<li id="connectionMsg" style="margin: 0.5em auto;" class="' + className + '">').append(msgTag));
            $('#messages').scrollTop($('#messages')[0].scrollHeight);
        }
    });

    socket.on('disconnect', function(user){
        if(user === "transport close"){
            location.reload();
        }
        if(user !== USERNAME){
            var msgTag = document.createElement('div');
            msgTag.id = 'messageTag';
            msgTag.innerHTML = user + ' has disconnected!';
            jQuery('#messages').append($('<li id="connectionMsg" style="margin: 0.5em auto;" class="' + className + '">').append(msgTag));
            $('#messages').scrollTop($('#messages')[0].scrollHeight);
        }
    });

    // Recieving message from server.
    socket.on('chat message', function(msg){
        // Collects data by splitting at space.

        var boolRetype = msg.edit;
        var userName = msg.user;
        var className = msg.classN;
        var message = msg.msg;

        // When recieveing message, it will check whether current chatroom is active.
        if(activeSession === false && !boolRetype){
            inactiveMessageCount += 1;
            document.title = inactiveMessageCount;

            notifSound.play();
            Push.create("You have new messages!",{
                body: userName + ": " + message,
                timeout: 5000,
                icon: '../img/NotificationIcon.jpg',
                onClick: function(){window.focus();Push.clear()},
                vibrate: [200, 100, 200, 100, 200, 100, 200]
            });
        }

        // splits to check if the last value is one of the below image/gif formats.
        var img = message.split('.').pop();
        // First checks whether it's an image or not.
        if(jQuery.inArray(img, ["gif", "jpg", "jpeg", "png"]) !== -1){
            if(user === userName){
                jQuery('#messages').append(jQuery('<li id="senderImg">').append(jQuery('<img src="' + message + '" alt="sent by ' + userName + '" />')))
            } else {
                jQuery('#messages').append(jQuery('<li id="recieverImg">').append(jQuery('<p>').html(userName.bold())).append(jQuery('<img src="' + message + '" alt="sent by ' + userName + '" />')));
            }
		} else if(jQuery.inArray(img, ['mp4', 'wmv', 'mov', 'flv']) !== -1){
			if(user === userName){
                jQuery('#messages').append(jQuery('<li id="senderVideo">').append(jQuery('<video src="' + message + '" class="video" alt="sent by ' + userName + '" />')))
            } else {
                jQuery('#messages').append(jQuery('<li id="recieverVideo">').append(jQuery('<p>').html(userName.bold())).append(jQuery('<video src="' + message + '" class="video" alt="sent by ' + userName + '" />')));
            }
			
			
			$('.video').mouseover(function(){
				jQuery(this).get(0).play();
			}).mouseout(function(){
				jQuery(this).get(0).pause();
			})
		
        } else if(message.includes('https://www.youtube.com/watch?') || message.includes('https://youtu.be/')){
			var splitter = message.includes('https://www.youtube.com/watch?') ? message.split('=')[1] : message.split('/').pop();
			message = 'https://www.youtube.com/embed/' + splitter.split('&')[0];
			if(user === userName){
                jQuery('#messages').append(jQuery('<li id="senderYT">').append(jQuery('<iFrame src="' + message + '" class="video" alt="sent by ' + userName + '" />')))
            } else {
                jQuery('#messages').append(jQuery('<li id="recieverYT">').append(jQuery('<p>').html(userName.bold())).append(jQuery('<iFrame src="' + message + '" class="video" alt="sent by ' + userName + '" />')));
            }
		}else {
            // Retyping the message either from sender or reciever.
            if (boolRetype === true) {
                if (user === userName) {
                    jQuery('#messages li#sender:last')[0].innerHTML = message;
                } else {
                    jQuery('#messages li#reciever.' + className + ':last div#messageTag')[0].innerHTML = message;
                }
                reType = false;
            } else {
                // Default message send.
                if (user === userName) {
                    jQuery('#messages').append($('<li id="sender" class="' + className + '">').text(message));
                } else {
                    var userTag = document.createElement('div');
                    userTag.id = 'nameTag';
                    userTag.innerHTML = userName.bold();
                    var msgTag = document.createElement('div');
                    msgTag.id = 'messageTag';
                    msgTag.innerHTML = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    jQuery('#messages').append($('<li id="reciever" class="' + className + '">').append(userTag).append(msgTag));}
                    //jQuery('#messages').append($('<li id="reciever" class="' + className + '">').append($('<div id="nameTag">').html(userName.bold()) + $('<div id="messageTag">').html(message)));}
            }
        }

            $('#messages').scrollTop($('#messages')[0].scrollHeight);

    });

    // This function is list every active user in session to the left hand side.
    socket.on('people', function(onlineList){

        var numberOfPeople = onlineList.length;//msg.split(' == = == ')[1];
        var listOfPeople = onlineList;//msg.split(' == = == ')[0];

        //listOfPeople = listOfPeople.split(',');

        jQuery('.Remove').remove();

        for(np = 0; np<listOfPeople.length; np++){
            jQuery('#listedPeople').append($('<li class="Remove">').text(listOfPeople[np].name));
        }

        jQuery('#numofPeople')[0].innerHTML = 'Current Online: ' + numberOfPeople;

    });

    // typing will change depending on whether you're typing.
    function timeoutFunction() {
        typing = false;
        var typingObj = {
            typing: false,
            userName: USERNAME
        };
        socket.emit("typing", typingObj);
    }

    // [USERNAME] is typing... 
    // Sets value to check if you're typing.
    jQuery('#m').keyup(function() {
        typing = true;
        var typingObj = {
            typing: true,
            userName: USERNAME
        };
        socket.emit('typing', typingObj);
        clearTimeout(timeout);
        timeout = setTimeout(timeoutFunction, 2000);
    });

    // Will input the data into a <P> tag.    
    socket.on('typing', function(data) {
            if (data.typing && data.userName !== USERNAME) {
            if($.inArray(data.userName, usersTyping) === -1) {
                usersTyping.push(data.userName);
            }
                if(usersTyping.length > 1) {
                    jQuery('.typing').html(usersTyping.join(", ") + ' is typing...');
                } else {
                    jQuery('.typing').html(usersTyping[0] + ' is typing...');
                }

        } else {
            if(data.userName !== USERNAME) {
                var index = usersTyping.indexOf(data.userName);
                usersTyping.splice(index, 1);
                jQuery('.typing').html("");
            }
        }
    });

    socket.on('debug', function(data){
        console.log('--- DEBUG DATA ---');
        console.log(data);
        console.log('--- END DEBUG DATA ---');
    });

};



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

function toggleRegister(){
    $('#register').toggleClass('register-open');
}
function toggleForgotPass(){
    $('#forgotPass').toggleClass('forgotPass-open');
}

function signupAcc(){
    $('#regEmail')[0].style.border = 'none';
    $('#regUName')[0].style.border = 'none';
    $('#regDName')[0].style.border = 'none';
    $('#regPWord')[0].style.border = 'none';
    $('#regPWordC')[0].style.border = 'none';
    var valid = true;
    if(document.getElementById('regUName').value.length < 3){
        console.error('BAD USERNAME');
        valid = false;
        $('#regUName')[0].style.border = '3px #f00 solid';
        $('#regError')[0].innerHTML = 'Username must be at least 3 characters'
    }

    if(!$('#regDName').val().length > 0){
        console.error('BAD DISPLAYNAME');
        valid = false;
        $('#regDName')[0].style.border = '3px #f00 solid';
        $('#regError')[0].innerHTML = 'Enter a display name!'
    }

    if(!/^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/.test($('#regEmail').val())){
        valid = false;
        $('#regEmail')[0].style.border = '3px #f00 solid';
        $('#regError')[0].innerHTML = 'Enter a valid email'
    }

    if(document.getElementById('regPWord').value.length < 8){
        console.error('BAD PASSWORD');
        valid = false;
        $('#regPWord')[0].style.border = '3px #f00 solid';
        $('#regError')[0].innerHTML = 'Password must have 8 characters or more'
    }

    if($('#regPWord').val() !== $('#regPWordC').val()){
        console.error('BAD PASSWORD CONFIRM');
        valid = false;
        $('#regPWord')[0].style.border = '3px #f00 solid';
        $('#regPWordC')[0].style.border = '3px #f00 solid';
        $('#regError')[0].innerHTML = 'Passwords do not match'
    }

    if(valid) {
        var uDetails = {
            userN: $('#regUName').val(),
            userD: $('#regDName').val(),
            userE: $('#regEmail').val(),
            userP: $('#regPWord').val()
        };
        //loginSocket.emit('registerAccount', uDetails);
    }
}

function loginUser(){
    var uDetails = {
        userN: $('#loginUName').val(),
        userP: $('#loginPWord').val()
    };
    loginSocket.emit('login', uDetails);
}

loginSocket.on('doLogin', function(dName){
    submit(dName);
});

function forgotPassword(email){
    // The forgot password goes here, okay?
}