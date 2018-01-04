module.exports = function(io){
    io.on('connection', (socket) => {
        console.log('User connected! -> '+ socket.id + ' | ' + socket.request.remoteAddress);

        socket.on('join', (params, callback) => {
            socket.join(params.roomID);

            callback();
        });

        socket.on('send-message', (message, callback) => {
            console.log(message);
            io.to(message.roomID).emit('recieve-message', {
                message: message.message,
                roomID: message.roomID,
                sender: message.username,
            });
            callback();
        });
    })
};