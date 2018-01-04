$(document).ready(function(){
    $('.upload-btn').on('click', function(){
        $('#upload-input').click();
    });

    $('#CreateGroup').on('click', function(){
        let uploadInput = $('#upload-input');
        let groupName = $('#GroupName');
        if(groupName !== '') {
            if (uploadInput.val() !== '') {
                let formData = new FormData();
                formData.append('group-name', groupName.val());
                formData.append('upload', uploadInput[0].files[0]);

                $.ajax({
                    url: '/createGroup',
                    type: 'POST',
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: function(res) {
                        uploadInput.val('');
                        console.log('Done!');
                        console.log(res);
                    },
                })
            }
        }
    });
});