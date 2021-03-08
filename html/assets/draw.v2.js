var canvas = document.getElementById('canvasarea'),
    context = canvas.getContext('2d');
var base_image = new Image();
base_image.src = image_path; //Load Image ;
base_image.onload = function() {
    context.drawImage(base_image, 0, 0);
}

function drawImage() {}
var strokeWidth = 1;
drawCount = 1;

canvas.addEventListener("mousemove", function(e) {
    drawRectangleOnCanvas.handleMouseMove(e);
}, false);
canvas.addEventListener("mousedown", function(e) {
    drawRectangleOnCanvas.handleMouseDown(e);
}, false);
canvas.addEventListener("mouseup", function(e) {
    drawRectangleOnCanvas.handleMouseUp(e);
}, false);
canvas.addEventListener("mouseout", function(e) {
    drawRectangleOnCanvas.handleMouseOut(e);
}, false);


$("#selectClass").bind("focus", function(e) {
    // $(this).val('');
    var sel = $("#selectClass")
    drawRectangleOnCanvas.selectClassFocus(sel);
});
$("#selectClass").bind("change", function(e) {
    var sel = $("#selectClass")
    drawRectangleOnCanvas.selectClassChange(sel);
    // var selectedClass = $(this).val()
    // console.log('-------' + selectedClass)
});




function reOffset() {
    var BB = canvas.getBoundingClientRect();
    recOffsetX = BB.left;
    recOffsetY = BB.top;
}
var recOffsetX, recOffsetY;
reOffset();
window.onscroll = function() {
    reOffset();
}
window.onresize = function() {
    reOffset();
}

var isRecDown = false;
var startX, startY;

var rects = [];
var newRect;
var selectedClass;
var drawRectangleOnCanvas = {
    selectClassFocus: function(sel) {
        sel.val('');
    },
    selectClassChange: function(sel) {
        selectedClass = sel.val()
        console.log('-------' + selectedClass)
    },
    handleMouseDown: function(e) {
        if (selectedClass == undefined) {
            return
        }
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();
        btnCode = e.button;

        switch (btnCode) {
            case 0:

                startX = parseInt(e.clientX - recOffsetX);
                startY = parseInt(e.clientY - recOffsetY);

                // Put your mousedown stuff here
                isRecDown = true;
                break;

            case 1:
                console.log('Middle button clicked.');
                mouseX = parseInt(e.clientX - recOffsetX);
                mouseY = parseInt(e.clientY - recOffsetY);
                console.log("mouseX: " + mouseX + " -- mouseY: " + mouseY)
                $('#coords_mc').html(`<br>mouseX:${mouseX} mouseY:${mouseY}<br>`);

                for (var i = 0; i < rects.length; i++) {
                    var r = rects[i];
                    x1 = r.left
                    y1 = r.top
                    x2 = r.right
                    y2 = r.bottom
                    c = r.color
                    // w = r.right - r.left
                    // h = r.bottom - r.top
                    if ((x1 < mouseX && y1 < mouseY) && (x2 > mouseX && y2 > mouseY)) {
                        $('#coords_mc').append(`2[IN] x1:${x1} y1:${y1} to x2:${x2}, y2:${y2} - c: ${c}<br>`);
                        rects.splice(i, 1);
                        break;
                    } else {
                        $('#coords_mc').append(`2[OUT] x1:${x1} y1:${y1} to x2:${x2}, y2:${y2} - c: ${c}<br>`);
                    }
                }
                drawRectangleOnCanvas.drawAll();
                break;

            case 2:
                console.log('Right button clicked.');
                break;

            default:
                console.log('Unexpected code: ' + btnCode);
        }

        startX = parseInt(e.clientX - recOffsetX);
        startY = parseInt(e.clientY - recOffsetY);

        // Put your mousedown stuff here
        isRecDown = true;
    },

    handleMouseUp: function(e) {
        if (selectedClass == undefined) {
            $("#message_display").attr('class', 'warn');
            $('#message_display').show();
            $("#message_display").contents()[0].data = 'Uhh....! select a class first';
            isRecDown = false;
            return
        }
        btnCode = e.button;
        if (btnCode != 0) {
            isRecDown = false;
            return
        }
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();
        btnCode = e.button;


        mouseX = parseInt(e.clientX - recOffsetX);
        mouseY = parseInt(e.clientY - recOffsetY);

        // Put your mouseup stuff here
        isRecDown = false;

        //if(!willOverlap(newRect)){
        rects.push(newRect);
        //}
        drawRectangleOnCanvas.drawAll();


    },

    drawAll: function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(base_image, 0, 0);
        context.lineWidth = strokeWidth;
        // console.log(rects)
        for (var i = 0; i < rects.length; i++) {
            var r = rects[i];
            context.strokeStyle = r.color;
            context.globalAlpha = 1;
            context.strokeRect(r.left, r.top, r.right - r.left, r.bottom - r.top);

            context.beginPath();
            // context.arc(r.left, r.top, 15, 0, Math.PI * 2, true);
            // context.closePath();
            // context.fillStyle = r.color;
            // context.fill();

            var text = drawCount;
            context.fillStyle = "#fff";
            // var font = "bold " + 2 + "px serif";
            var font = "16px Arial";
            context.font = font;
            var width = context.measureText(text).width;
            var height = context.measureText("w").width; // this is a GUESS of height
            // context.fillText(r.selectedClass, r.left - (width / 2), r.top + (height / 2));
            context.fillText(r.selectedClass, r.left+5, r.top+15 );

        }
    },

    handleMouseOut: function(e) {

        // btnCode = e.button;
        // if (btnCode != 0) {
        //     return
        // }
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        mouseX = parseInt(e.clientX - recOffsetX);
        mouseY = parseInt(e.clientY - recOffsetY);

        // Put your mouseOut stuff here
        isRecDown = false;
    },

    handleMouseMove: function(e) {
        // btnCode = e.button;
        // if (btnCode != 0) {
        //     return
        // }
        if (!isRecDown) {
            return;
        }
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        mouseX = parseInt(e.clientX - recOffsetX);
        mouseY = parseInt(e.clientY - recOffsetY);
        newRect = {
            left: Math.min(startX, mouseX),
            right: Math.max(startX, mouseX),
            top: Math.min(startY, mouseY),
            bottom: Math.max(startY, mouseY),
            color: "red",
            selectedClass: selectedClass
        }
        drawRectangleOnCanvas.drawAll();
        context.strokeStyle = "green";
        context.lineWidth = strokeWidth;
        context.globalAlpha = 1;
        w = mouseX - startX
        h = mouseY - startY
        context.strokeRect(startX, startY, w, h);
        $('#coords').html('current: ' + startX + ', ' + startY + ' to ' + w + ',' + h + '<br>');
        $('#coords').append('selectedClass: ' + selectedClass + "<br>");
    }
}

