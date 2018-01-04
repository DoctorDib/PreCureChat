const path = require('path');
const fs = require('fs');

module.exports = function(formidable, mongoose, Group, util){
    return {
        setRouting: function(router){
            router.get('/dashboard', this.adminDashboard);

            router.post('/createGroup', this.createGroup);
            router.post('/dashboard', this.postDashboard);
        },

        adminDashboard: function(req, res){
            res.render('admin/dashboard');
        },

        createGroup: function(req, res){
            const form = new formidable.IncomingForm();
            form.uploadDir = path.join(__dirname, '../public/uploads/group-images');
            let groupName = '';
            const newGroup = Group();


            form.on('field', (field, value) => {
                if(field === 'group-name'){
                    groupName = value.replace(/ /g, '_')+'-groupicon-';
                    newGroup.name = value;
                }
            });

            form.on('file', (field, file) => {
                fs.rename(file.path, path.join(form.uploadDir, 'tmp\\'+groupName+file.name), (err) => {
                    if(err) throw err;
                    let oldFile = 'tmp\\'+groupName+file.name;
                    console.log('File successfully renamed!');
                    newGroup.image = groupName+file.name;
                    newGroup.save((err, group) => {
                        if(err){
                            console.error(err);
                            res.sendStatus(500);
                        } else {
                            console.log(group.id);
                            const newPath = path.join(form.uploadDir, group.id);
                            console.log(newPath);
                            if(fs.existsSync(newPath)) {
                                fs.rename(path.join(form.uploadDir, oldFile), path.join(newPath, groupName+file.name), (err) => {
                                    if (err) throw err;
                                    res.sendStatus(200);
                                });
                            } else {
                                fs.mkdirSync(newPath);
                                fs.rename(path.join(form.uploadDir, oldFile), path.join(newPath, groupName+file.name), (err) => {
                                    if (err) throw err;
                                    res.sendStatus(200);
                                });
                            }
                        }
                    });
                });
            });

            form.on('error', (err) => {
                console.error(err);
            });

            form.on('end', () => {
                console.log('File successfully uploaded!');
            });

            form.parse(req);
        },

        postDashboard: function(req, res){

        }
    }
};