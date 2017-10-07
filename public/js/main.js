//======================================================================================================================
// USER SETUP
//======================================================================================================================
// USERNAME - To identify the sender.
// className - Slugified version of USERNAME (Each user has their own class when sending a message)
// user - Helps identify if the message was sent from the sender.
var USERNAME = '';
var DISPLAYNAME = '';
var UID = '';
// var user = '';
//======================================================================================================================
// MESSAGE SETUP
//======================================================================================================================
var message = {};

// lastCacheMsh - Always holds the latest up-to-date message.
var lastCacheMsg = '';
// reTyep - will set when the user clicks up arrow.
var reType = false;
//======================================================================================================================
// 
//======================================================================================================================
var timeout;

// Inactive session boolean.
var activeSession = true;
// counts how many missed messages and places value into tab title.
var inactiveMessageCount = 0;
// Changable notification sound.
var notifSound = new Audio('./sound/NewMessage.mp3');
var isLoggedIn = false;
var loginSocket = io('/login');
var roomSockets = [];
var socket;
var connected = false;
//======================================================================================================================
// COOKIES + TOKENS
//======================================================================================================================
var checkCookie = function (token){

    try {
        var cookies = token.split('---');
        var cookies_obj = {
            token: cookies[0].split('=')[1],
            expiry: cookies[1].split('=')[1]
        };
        
        return cookies_obj;
    } catch(err){ return false; }
};

// MAKE IT DETECT IF COOKIE
var token = checkCookie(document.cookie);

function tokenCheck(){
    if(token !== false){
        loginSocket.emit('tokenLogin', token);
    }
}

tokenCheck();
//======================================================================================================================
// ACTIVITY DETECTION
//======================================================================================================================
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

var isAway = false;
function setAway() {
    socket.emit('setStatus', USERNAME, 2);
    isAway = true;
}

var awayTimeout; // Used to store the timeout function

// Called on un focus
window.onblur = function(){
    clearTimeout(awayTimeout);
    awayTimeout = setTimeout(setAway, 30000);
};

// called on focus
window.onfocus = function(){
    clearTimeout(awayTimeout);
    if(isAway){
        isAway = false;
        socket.emit('setStatus', USERNAME, 1);
    }
};
//======================================================================================================================
// LOGGED IN - Called when a user is logged in
//           - Also sets up the socket connection
//======================================================================================================================
function loggedIn(){
    // If the user isn't connected, connect
    if(!connected){
        socket = io();
        connected = true;
    }

    // Tell the server we have logged in
    socket.emit('login', USERNAME);
};

//======================================================================================================================
// ROOM CODE
//======================================================================================================================

var rooms = {};
var currentRoom = '';

// Changes the connected room
function connectToRoom(roomName){
    try{
        rooms[currentRoom].isLoggedIn = false;
    } catch(e){}
    socket = io('/' + roomName);
    rooms[roomName] = new Room(socket);
    rooms[roomName].isLoggedIn = true;
    currentRoom = roomName;
}

//--------------------
// ROOM OBJECT
//--------------------
function Room(socket){
    this.isLoggedIn = false;
    var this_ = this;

    var usersTyping = [];
    var account_status = {
        0: 'account_status_offline',
        1: 'account_status_online',
        2: 'account_status_away',
        3: 'account_status_busy'
    };
    // -----------------------------------------------
    // SEND MESSAGE TO SERVER - Sends current value in input box to the server.
    // -----------------------------------------------
    jQuery('#messageInput').submit(function(e){
        if(this_.isLoggedIn) {
            message = {edit: reType, user: USERNAME, classN: UID, msg: jQuery('#m').val()};
            socket.emit('onMessage', message);
            timeoutFunction();
            lastCacheMsg = jQuery('#m').val();
            jQuery('#messages').scrollTop(jQuery('#messages')[0].scrollHeight);
            jQuery('#m').val('');
            return false;
        }
    });

    // -----------------------------------------------
    // DETECTS LOGIN | DEPRECATED
    // -----------------------------------------------
    socket.on('login', function(user){
        if(this_.isLoggedIn) {

            var msgTag = document.createElement('div');

            msgTag.id = 'messageTag';
            msgTag.innerHTML = user + ' has logged in!';
            jQuery('#messages').append($('<li id="connectionMsg" style="margin: 0.5em auto;" class="' + UID + '">').append(msgTag));
            jQuery('#messages').scrollTop(jQuery('#messages')[0].scrollHeight);
        }
    });

    // -----------------------------------------------
    // DETECTS DISCONNECT
    // -----------------------------------------------
    socket.on('disconnect', function(user){
        if(this_.isLoggedIn) {
            if (user === "transport close") {
                location.reload();
            }

            if (user !== USERNAME) {
                var msgTag = document.createElement('div');
                msgTag.id = 'messageTag';
                msgTag.innerHTML = user + ' has disconnected!';
                jQuery('#messages').append($('<li id="connectionMsg" style="margin: 0.5em auto;" class="' + UID + '">').append(msgTag));
                //messages.scrollTop(messages[0].scrollHeight);
            }
        }
    });

    // -----------------------------------------------
    // RETRIEVING MESSAGE FROM SERVER
    // -----------------------------------------------
    socket.on('onMessage', function(msg){
        if(this_.isLoggedIn) {
            // Collects data by splitting at space.

            var boolRetype = msg.edit;
            var userName = msg.user;
            var className = msg.classN;
            var message = msg.msg;

            // When receiving message, it will check whether current chatroom is active.
            if (activeSession === false && !boolRetype) {
                inactiveMessageCount += 1;
                document.title = inactiveMessageCount;

                notifSound.play();
                Push.create("You have new messages!", {
                    body: userName + ": " + message,
                    timeout: 5000,
                    icon: '../img/NotificationIcon.jpg',
                    onClick: function () {
                        window.focus();
                        Push.clear()
                    },
                    vibrate: [200, 100, 200, 100, 200, 100, 200]
                });
            }

            // splits to check if the last value is one of the below image/gif formats.
            var img = message.split('.').pop();
            // First checks whether it's an image or not.
            if (jQuery.inArray(img, ["gif", "jpg", "jpeg", "png"]) !== -1) {
                var msgid = USERNAME === userName ? "senderImg" : "recieverImg";
                jQuery('#messages').append(
                    jQuery('<li id="'+msgid+'">').append(
                        USERNAME === userName ? jQuery('<img src="' + message + '" alt="sent by ' + userName + '" />') : (jQuery('<p>').html(userName.bold()), jQuery('<img src="' + message + '" alt="sent by ' + userName + '" />'))
                    )
                );
            // Is the message a video?
            } else if (jQuery.inArray(img, ['mp4', 'wmv', 'mov', 'flv', 'webm']) !== -1) {
                var msgid = USERNAME === userName ? "senderVideo" : "recieverVideo";
                jQuery('#messages').append(
                    jQuery('<li id="'+msgid+'">').append(
                        jQuery('<video src="' + message + '" class="video" alt="sent by ' + userName + '" />')
                    )
                );

                // Play the video on mouse over
                $('.video').mouseover(function () {
                    jQuery(this).get(0).play();
                }).mouseout(function () {
                    jQuery(this).get(0).pause();
                })

            // Is the message a youtube video?
            } else if (message.includes('https://www.youtube.com/watch?') || message.includes('https://youtu.be/')) {
                var splitter = message.includes('https://www.youtube.com/watch?') ? message.split('=')[1] : message.split('/').pop();
                message = 'https://www.youtube.com/embed/' + splitter.split('&')[0];
                var msgid = USERNAME === userName ? "senderYT" : "recieverYT";
                jQuery('#messages').append(
                    jQuery('<li id="'+msgid+'">').append(
                        USERNAME === userName ? jQuery('<iFrame src="' + message + '" class="video" alt="sent by ' + userName + '" />') : (jQuery('<p>').html(userName.bold()), jQuery('<iFrame src="' + message + '" class="video" alt="sent by ' + userName + '" />'))
                    )
                );

            // Nah it's just a normal one
            } else {
                // Retyping the message either from sender or reciever.
                if (boolRetype === true) {
                    if (USERNAME === userName) {
                        jQuery('#messages li#sender:last')[0].innerHTML = '<span>' + message + '</span>';
                    } else {
                        jQuery('#messages li#reciever.' + className + ':last div#messageTag')[0].innerHTML = '<span>' + message + '</span>';
                    }
                    reType = false;
                } else {
                    // Default message send.
                    if (USERNAME === userName) {
                        var msgBox = document.createElement('li');
                        msgBox.id = 'sender';
                        msgBox.className = className;
                        msgBox.innerHTML = '<span>' + message + '</span>';
                        jQuery('#messages').append(msgBox);
                    } else {
                        var userTag = document.createElement('div');
                        userTag.id = 'nameTag';
                        userTag.innerHTML = userName.bold();
                        var msgTag = document.createElement('div');
                        msgTag.id = 'messageTag';
                        msgTag.innerHTML = '<span>' + message + '</span>';
                        jQuery('#messages').append($('<li id="reciever" class="' + className + '">').append(userTag).append(msgTag));
                    }
                }
            }

            jQuery('#messages').scrollTop(jQuery('#messages')[0].scrollHeight);
        }
    });

    // -----------------------------------------------
    // LIST ONLINE USERS - This function lists every active user in session to the left hand side.
    // -----------------------------------------------
    socket.on('people', function(onlineList){
        if(this_.isLoggedIn) {
            // Resets list
            jQuery('#listedPeople').html('');

            $.each(onlineList, function (i, row) {
                jQuery('#listedPeople').append(
                    // jQuery('<div id="list_account" onClick="collectUserData(\'' + row.username + '\')" style="cursor: pointer;">').append(
                    jQuery('<div id="list_account" onClick="" style="cursor: pointer;">').append(
                        jQuery('<div id="account_img" class="' + account_status[row.user_status] + '">').css('background-image', 'url("' + row.picture + '")'),
                        jQuery('<div id="account_user_names">').append(
                            jQuery('<span id="account_display_name">').html(row.display_name),
                            jQuery('<span id="account_user_name">').html('@' + row.username)
                        )
                    )
                )
            });
        }
    });

    // -----------------------------------------------
    // TYPING TRIGGER - Triggers when a user is typing.
    // -----------------------------------------------
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
        if(this_.isLoggedIn) {
            if (data.typing && data.userName !== USERNAME) {
                if ($.inArray(data.userName, usersTyping) === -1) {
                    usersTyping.push(data.userName);
                }
                if (usersTyping.length > 1) {
                    jQuery('.typing').html(usersTyping.join(", ") + ' is typing...');
                } else {
                    jQuery('.typing').html(usersTyping[0] + ' is typing...');
                }

            } else {
                if (data.userName !== USERNAME) {
                    var index = usersTyping.indexOf(data.userName);
                    usersTyping.splice(index, 1);
                    jQuery('.typing').html("");
                }
            }
        }
    });
}
//======================================================================================================================
// USER LOGIN BUTTON - submit() will run once the launcher button has been clicked.
//======================================================================================================================
function submit(uData) {
    // Setup user variables
    USERNAME = uData.username;
    DISPLAYNAME = uData.uName;
    token = {
        token: uData.token,
        expiry: uData.tokenExpire
    };
    document.cookie = 'token=' + token.token + '--- expires=' + token.expiry + ';';
    className = uData.uID;

    jQuery('#launcher')[0].style.display = "none";
    setTimeout(function(){
        isLoggedIn = true;
        // sockets.emit('login', USERNAME);
    }, 100);
    loggedIn();
    //loggedIn = true;
};


// Function taken from the net - Places your cursor at the end of the sentence.
jQuery.fn.putCursorAtEnd = function() {
    return this.each(function() {
        var $element = $(this),
        element = this;
        if (!$element.is(":focus")) {
            $element.focus();
        }
        if (el.setSelectionRange) {
            var len = $element.val().length * 2;
            setTimeout(function() {
                element.setSelectionRange(len, len);
            }, 1);
        } else {
            $element.val($element.val());
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

function toggleAccount(){
    $('#account_page').toggleClass('account_page_open');
    $('#mainChat').toggleClass('mainChat-open');
    $('#leftAccount').toggleClass('leftAccount-close');
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
        loginSocket.emit('registerAccount', uDetails);
    }
}

function loginUser(){
    var uDetails = {
        userN: $('#loginUName').val(),
        userP: $('#loginPWord').val()
    };
    loginSocket.emit('login', uDetails);
}

loginSocket.on('doLogin', function(uData){
    //collectUserData(uData.uName);
    USERNAME = uData.username;
    submit(uData);
});

function forgotPassword(email){
    // The forgot password goes here, okay?
}

function Search(){
    var username = jQuery('#search_user')[0].value;
    // var socket = io();

    var account_status = {
        0: 'account_status_offline',
        1: 'account_status_online',
        2: 'account_status_away',
        3: 'account_status_busy'
    };

    socket.emit('userSearch', username);

    socket.on('listResults', function(listResults) {
        $('#user_search_results').html('');
        if(jQuery('#search_user')[0].value !== ''){
            $.each(listResults, function (i, row) {
                jQuery('#user_search_results').append(
                    // jQuery('<div id="list_account" onClick="collectUserData(\'' + row.username + '\')" style="cursor: pointer;">').append(
                    jQuery('<div id="list_account" onClick="connectToRoom("' + row.username + '")" style="cursor: pointer;">').append(
                        //connectToRoom(" + row.username + ")
                        jQuery('<div id="account_img" class="'+account_status[row.user_status]+'">').css('background-image', 'url("'+row.picture+'")'),
                        jQuery('<div id="account_user_names">').append(
                            jQuery('<span id="account_display_name">').html(row.display_name),
                            jQuery('<span id="account_user_name">').html('@'+row.username)
                        )
                    )
                );
            });
        }
    });
}

var searchTimeout = null;
function searchKeyUp(){
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () {
        Search();
        }
    , 500);
}