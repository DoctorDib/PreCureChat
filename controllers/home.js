'use strict';

module.exports = function(_, async, Group){
    return {
        setRouting: function(router) {
            router.get('/home', this.homePage);
        },

        homePage: function(req, res) {
            async.parallel([
                function(callback){
                    Group.find({}, (err, result) => {
                        callback(err, result);
                    });
                },

                function(callback){
                    Group.aggregate({
                        $group: {
                            _id: "$name"
                        }
                    },(err, result) => {
                        callback(err, result);
                    })
                }
            ], (err, result) => {
                const groupRes = result[0];
                const groupNames = result[1];

                const dataChunk = [];
                const chunkSize = 3;

                for( let i = 0; i < groupRes.length; i+= chunkSize){
                    dataChunk.push(groupRes.slice(i, i + chunkSize));
                }

                res.render('home', {title: 'WebChat - Home', data: dataChunk, groupNames});
            });

        }
    }
};