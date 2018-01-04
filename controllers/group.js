'use strict';

module.exports = function(){
    return {
        setRouting: function(router){
            router.get('/group/:id', this.groupPage);
        },

        groupPage: function(req, res){
            const groupID = req.params.id;
            res.render('chatrooms/group', {title:'WebChat - Group', user:req.user, groupID});
        }
    }
};