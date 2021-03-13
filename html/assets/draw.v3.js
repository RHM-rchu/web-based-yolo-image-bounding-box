$("#clear").click(function() {
    var canvas = document.getElementById('canvasarea');
    var ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var base_image = new Image();
    base_image.src = image_path; //Load Image ;
    base_image.onload = function() {
        ctx.drawImage(base_image, 0, 0);
    }
    // ctx.fillText("Sample String", 20, 50);
});

$(function() {
    var canvas = document.getElementById('canvasarea');
    // if (canvas.getContext) {
    //     var ctx = canvas.getContext('2d');
    //     ctx.fillText("Sample String", 20, 50);
    // }

    var ctx = canvas.getContext('2d');
    var base_image = new Image();
    base_image.src = image_path; //Load Image ;
    base_image.onload = function() {
        ctx.drawImage(base_image, 0, 0);
    }
    //Variables
    var canvasx = $(canvas).offset().left;
    var canvasy = $(canvas).offset().top;
    var last_mousex = last_mousey = w = h = 0;
    var prev_x = prev_y = prev_w = prev_h = 0;
    var mousex = mousey = 0;
    var mousedown = false;

    //Mousedown
    $(canvas).on('mousedown', function(e) {
        last_mousex = parseInt(e.clientX - canvasx);
        last_mousey = parseInt(e.clientY - canvasy);
        mousedown = true;

    });

    //Mouseup
    $(canvas).on('mouseup', function(e) {
        w = h = 0;
        mousedown = false;
    });

    //Mousemove
    $(canvas).on('mousemove', function(e) {
        mousex = parseInt(e.clientX - canvasx);
        mousey = parseInt(e.clientY - canvasy);
        if (mousedown) {
            prev_x = last_mousex;
            prev_y = last_mousey;
            prev_w = w;
            prev_h = h;
            ctx.clearRect(prev_x - 1, prev_y - 1, prev_w + 2, prev_h + 2);

            w = mousex - last_mousex;
            h = mousey - last_mousey;
            ctx.beginPath();
            ctx.strokeStyle = 'red';
            ctx.strokeRect(last_mousex, last_mousey, w, h);
            // ctx.rect(last_mousex, last_mousey, w, h);
            ctx.lineWidth = 1;
            // ctx.stroke();
        }
        //Output
        $('#coords').html('current: ' + mousex + ', ' + mousey + '<br/>last: ' + last_mousex + ', ' + last_mousey + '<br/>mousedown: ' + mousedown);
    });

})