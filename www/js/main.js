var HomePage = React.createClass({
    render: function () {
        return (
            <div>
                <h1> hello </h1>
            </div>
        );
    }
});

feed = (function () {

    var socket = io();

    return {
        onChange: function(callback) {
            socket.on('stock', callback);
        },
        watch: function(symbols) {
            socket.emit('join', symbols);
        },
        unwatch: function(symbol) {
            socket.emit('leave', symbol);
        }
    };

}());

React.render(<HomePage />, document.getElementById('main'));