$(document).ready(function(){
    const socket = io();
    const roomID = $('#GroupID').val();
    const username = $('#Username').val();

    socket.on('connect', function(){
        console.log('You have connected!');
        const params = {
            roomID,
        };
        socket.emit('join', params, function(){
            console.log('Successfully joined!');
        });
    });

    $('#message-form').on('submit', function(e){
        e.preventDefault();
        socket.emit('send-message', {
            message: $('#msg').val(),
            username,
            roomID,
        }, function() {
            $('#msg').val('');
        });
    });

    socket.on('recieve-message', function(data){
        const template = $('#tmpl-message').html();
        const message = Mustache.render(template, {
            message: data.message,
            sender: data.sender,
        });

        $('#message-box').append(message);
    });
});