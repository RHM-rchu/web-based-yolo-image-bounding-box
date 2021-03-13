//--- ajax upload trigger
$("#img_files").on("change", function(e) {
    var file = $(this)[0].files[0];
    var upload = new Upload(file);
    $("div #upload-status").show();
    // execute upload
    upload.doUpload();
    $("div #upload-status").delay(1000).fadeOut(5000)
});

var Upload = function(file) {
    this.file = file;
};

Upload.prototype.getType = function() {
    return this.file.type;
};
Upload.prototype.getSize = function() {
    return this.file.size;
};
Upload.prototype.getName = function() {
    return this.file.name;
};
Upload.prototype.doUpload = function() {
    var that = this;
    var formData = new FormData();

    // add assoc key values, this will be posts values
    formData.append("file", this.file, this.getName());
    formData.append("upload_file", true);
    formData.append("project", project);

    $.ajax({
        type: "POST",
        url: "upload_file",
        xhr: function() {
            var myXhr = $.ajaxSettings.xhr();
            if (myXhr.upload) {
                myXhr.upload.addEventListener('progress', that.progressHandling, false);
            }
            return myXhr;
        },
        success: function(data) {
            // your callback here
            console.log(data)
        },
        error: function(error) {
            // handle error
            console.log(error)
        },
        async: true,
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        timeout: 60000
    });
};

Upload.prototype.progressHandling = function(event) {
    var percent = 0;
    var position = event.loaded || event.position;
    var total = event.total;
    // var progress_bar_id = "#progress-wrp";
    if (event.lengthComputable) {
        percent = Math.ceil(position / total * 100);
    }
    // // update progressbars classes so it fits your code
    $('#upload-status').attr('value', percent);
    $('#upload-status').attr('data-label', percent + " of 100");
};