var canvas = document.getElementById('canvasarea'),
    context = canvas.getContext('2d');
//--- for crosshair 
var context2 = context;
var base_image = new Image();
var image_height = 0,
    image_width = 0,
    strokeWidth = 1,
    drawCount = 1
classKey = 0;


function drawImage() {}

canvas.addEventListener("mousemove", function(e) {
    drawRectangleOnCanvas.handleMouseMove(e);
    drawRectangleOnCanvas.drawCrosshair(e)
}, false);
canvas.addEventListener("mousedown", function(e) {
    drawRectangleOnCanvas.handleMouseDown(e);
}, false);
canvas.addEventListener("mouseup", function(e) {
    drawRectangleOnCanvas.handleMouseUp(e);
}, false);
canvas.addEventListener("mouseout", function(e) {
    drawRectangleOnCanvas.handleMouseOut(e);
    drawRectangleOnCanvas.removeCrosshair(e)
}, false);


$("#selectClass").bind("focus", function(e) {
    // $(this).val('');
    var sel = $("#selectClass")
    drawRectangleOnCanvas.selectClassFocus(sel);
});
$("#selectClass").bind("change", function(e) {
    var sel = $("#selectClass")
    drawRectangleOnCanvas.selectClassChange(sel);
    $("#selectClass").css("background-color", "");
    $("#selectClass").css("color", "");
});
$("div").delegate(".rectanglelist", "click", function() {
    var sel_id = $(this).attr('id')
    drawRectangleOnCanvas.removeRect(sel_id);
});
// no rigthclick menu in canvas
$('#canvasarea').contextmenu(function() {
    return false;
});


var showCrosshair = true
var isRecDown = false;
var startX, startY;
var rects = [];
var newRect;
var selectedClass;
var drawRectangleOnCanvas = {

    loadImage: function(img) {
        base_image.src = img; //Load Image ;

        base_image.onload = function() {
            image_height = this.height
            image_width = this.width
            canvas.width = image_width;
            canvas.height = image_height;
            context.drawImage(base_image, 0, 0);
            drawRectangleOnCanvas.aj_coord_lookup(base_image.src)
        }
        rects = []
        isRecDown = false;
        showCrosshair = true;
        $(".canvasarea_name").text(img)
        $('#coords').html('')
    },

    removeCrosshair: function(e) {
        if (showCrosshair == true) {
            drawRectangleOnCanvas.drawAll();
            context2.closePath();
        }
    },
    drawCrosshair: function(e) {
        if (showCrosshair == true) {
            var x = e.pageX - canvas.offsetLeft;
            var y = e.pageY - canvas.offsetTop;
            // var x = e.pageX - recOffsetX;
            // var y = e.pageY - recOffsetY;
            drawRectangleOnCanvas.drawAll();
            context2.beginPath();
            context2.moveTo(0, y);
            context2.lineTo(image_width, y);
            context2.moveTo(x, 0);
            context2.lineTo(x, image_height);
            context2.strokeStyle = "white"; //"rgb(255,255,255)";
            context2.stroke();
            context2.closePath();
        }
    },
    removeRect: function(sel_id) {
        console.log(`Remove (${sel_id}) - ${rects[sel_id].selectedClass}`);
        rects.splice(sel_id, 1);
        drawRectangleOnCanvas.drawAll();
    },
    selectClassFocus: function(sel) {
        sel.val('');
    },
    selectClassChange: function(sel) {
        selectedClass = sel.val()
        $('#message_display').hide();
    },
    handleMouseDown: function(e) {
        if (selectedClass == undefined) {
            return
        }
        classKey = $.inArray(selectedClass, options);

        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();
        btnCode = e.button;

        switch (btnCode) {
            case 0: //left click

                startX = parseInt(e.clientX - canvas.offsetLeft);
                startY = parseInt(e.clientY - canvas.offsetTop);

                // Put your mousedown stuff here
                isRecDown = true;
                showCrosshair = false;
                break;

            case 1: //middle click 
            case 2: //right click

                mouseX = parseInt(e.clientX - canvas.offsetLeft);
                mouseY = parseInt(e.clientY - canvas.offsetTop);
                $('#coords_mc').html(`<br>mouseX:${mouseX} mouseY:${mouseY}<br>`);

                for (var i = 0; i < rects.length; i++) {
                    var r = rects[i];
                    x1 = r.left
                    y1 = r.top
                    x2 = r.right
                    y2 = r.bottom
                    c = r.color
                    sl = r.selectedClass
                    // w = r.right - r.left
                    // h = r.bottom - r.top
                    if ((x1 < mouseX && y1 < mouseY) && (x2 > mouseX && y2 > mouseY)) {
                        $('#coords_mc').append(`2[IN] x1:${x1} y1:${y1} to x2:${x2}, y2:${y2} - c: ${c}<br>`);
                        rects.splice(i, 1);
                        console.log(`Delete (${i}) - ${sl}`);
                        break;
                    } else {
                        $('#coords_mc').append(`2[OUT] x1:${x1} y1:${y1} to x2:${x2}, y2:${y2}- c: ${c}<br>`);
                    }
                }
                drawRectangleOnCanvas.drawAll();
                break;

            // case 2: //right click
            //     console.log('Right button clicked.');
            //     isRecDown = false;
            //     showCrosshair = true;
            //     break;

            default:
                console.log('Unexpected code: ' + btnCode);
        }

        startX = parseInt(e.clientX - canvas.offsetLeft);
        startY = parseInt(e.clientY - canvas.offsetTop);

        isRecDown = true;
    },

    handleMouseUp: function(e) {
        if (selectedClass == undefined) {
            $("#message_display").attr('class', 'warn');
            $('#message_display').show();
            $("#message_display").contents()[0].data = 'Uhh....! select a class first';
            $("#selectClass").css("background-color", "yellow");
            $("#selectClass").css("color", "red");
            // $("#select_mooo").attr('size',6);
            isRecDown = false;
            return
        }
        btnCode = e.button;
        if (btnCode != 0) {
            isRecDown = false;
            return
        }
        // console.log(newRect)
        if (newRect !== undefined && !("classKey" in newRect)) {
            // if(newRect['classKey'] === undefined ) {
            return
        }
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();
        btnCode = e.button;


        mouseX = parseInt(e.clientX - canvas.offsetLeft);
        mouseY = parseInt(e.clientY - canvas.offsetTop);

        isRecDown = false;
        showCrosshair = true;

        rects.push(newRect);
        newRect = {}

        console.log(`Add (${rects.length}) - ${selectedClass}`);

        drawRectangleOnCanvas.drawAll();


    },
    yoloCoordValuesConverter: function(x1, y1, x2, y2) {
        // YOLO TXT coordinate conversion
        //     Docs: https://manivannan-ai.medium.com/how-to-train-yolov2-to-detect-custom-objects-9010df784f36
        //     class> <x> <y> <width> <height>
        //     Where:
        //     <object-class> - integer number of object from 0 to (classes-1)
        //     <x> <y> <width> <height> - float values relative to width and height of image, it can be equal from (0.0 to 1.0]
        //     for example: <x> = <absolute_x> / <image_width> or <height> = <absolute_height> / <image_height>
        //     !!!atention: <x> <y> - are center of rectangle (are not top-left corner)
        if (x2 > x1) {
            xmin = x1
            xmax = x2
        } else {
            xmin = x2
            xmax = x1
        }
        if (y1 > y2) {
            ymin = y2
            ymax = y1
        } else {
            ymin = y1
            ymax = y2
        }
        dw = 1. / image_width
        dh = 1. / image_height
        x1 = (xmin + xmax) / 2.0
        y1 = (ymin + ymax) / 2.0
        x2 = xmax - xmin
        y2 = ymax - ymin
        var obj = {
            x1: (x1 * dw).toFixed(6),
            y1: (y1 * dh).toFixed(6),
            x2: (x2 * dw).toFixed(6),
            y2: (y2 * dh).toFixed(6)
        };
        return obj
    },
    yoloCoordValuesReverter: function(x1, y1, x2, y2) {
        // https://stackoverflow.com/questions/64096953/how-to-convert-yolo-format-bounding-box-coordinates-into-opencv-format
        dw = image_width
        dh = image_height
        l = Math.round((parseFloat(x1) - parseFloat(x2) / 2) * dw)
        t = Math.round((parseFloat(y1) - parseFloat(y2) / 2) * dh)
        r = Math.round((parseFloat(x1) + parseFloat(x2) / 2) * dw)
        b = Math.round((parseFloat(y1) + parseFloat(y2) / 2) * dh)
// console.log(`${l},${t},${r},${b},,${image_width},,${image_height}`)
        if (l < 0) {
            l = 0
        }
        if (r > dw - 1) {
            r = dw - 1
        }
        if (t < 0) {
            t = 0
        }
        if (b > dh - 1) {
            b = dh - 1
        }
        var obj = {
            x1: l,
            y1: t,
            x2: r,
            y2: b
        };
        return obj
    },

    drawAll: function() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(base_image, 0, 0);
        context.lineWidth = strokeWidth;

        $('#coords').html('<OL start="0">Click the element below to delete')
        for (var i = 0; i < rects.length; i++) {
            if (rects[i] == undefined) {
                continue;
            }
            var r = rects[i];
            context.strokeStyle = r.color;
            context.globalAlpha = 1;
            context.strokeRect(r.left, r.top, r.right - r.left, r.bottom - r.top);

            context.beginPath();
            // context.arc(r.left, r.top, 15, 0, Math.PI * 2, true);
            // context.closePath();
            // context.fillStyle = r.color;
            // context.fill();
            context.globalAlpha = 0.2;
            context.fillStyle = 'green';
            context.fillRect(r.left, r.top, r.right - r.left, r.bottom - r.top);
            context.globalAlpha = 1;

            var text = drawCount;
            context.fillStyle = "#fff";
            // var font = "bold " + 2 + "px serif";
            var font = "16px Arial";
            context.font = font;
            var width = context.measureText(text).width;
            var height = context.measureText("w").width; // this is a GUESS of height

            // context.fillText(r.selectedClass, r.left - (width / 2), r.top + (height / 2));
            context.fillText(`(${i}) ${r.selectedClass}`, r.left + 5, r.top + 15);

            // yoloCoords = drawRectangleOnCanvas.yoloCoordValuesConverter(r.left, r.top, r.right, r.bottom)
            // yoloCoordsr = drawRectangleOnCanvas.yoloCoordValuesReverter(yoloCoords.x1, yoloCoords.y1, yoloCoords.x2, yoloCoords.y2)
            // console.log(yoloCoordsr)

            $('#coords OL').append(
                `<LI class="rectanglelist" id="${i}">${r.selectedClass} - ${r.left},${r.top} to ${r.right},${r.bottom}` +
                `<br>${r.classKey} ${r.x1} ${r.y1} ${r.x2} ${r.y2}</LI>`
            );

        }
        $('#coords').append('</OL>')
    },

    handleMouseOut: function(e) {

        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        mouseX = parseInt(e.clientX - canvas.offsetLeft);
        mouseY = parseInt(e.clientY - canvas.offsetTop);

        // Put your mouseOut stuff here
        isRecDown = false;
    },

    handleMouseMove: function(e) {
        if (!isRecDown) {
            return;
        }
        // tell the browser we're handling this event
        e.preventDefault();
        e.stopPropagation();

        mouseX = parseInt(e.clientX - canvas.offsetLeft);
        mouseY = parseInt(e.clientY - canvas.offsetTop);

        var left = Math.min(startX, mouseX);
        var right = Math.max(startX, mouseX);
        var top = Math.min(startY, mouseY);
        var bottom = Math.max(startY, mouseY);

        yoloCoords = drawRectangleOnCanvas.yoloCoordValuesConverter(left, top, right, bottom)
        newRect = {
            left: left,
            right: right,
            top: top,
            bottom: bottom,
            x1: yoloCoords.x1,
            y1: yoloCoords.y1,
            x2: yoloCoords.x2,
            y2: yoloCoords.y2,
            color: "red",
            selectedClass: selectedClass,
            classKey: classKey
        }
        // newRect = {
        //     left: Math.min(startX, mouseX),
        //     right: Math.max(startX, mouseX),
        //     top: Math.min(startY, mouseY),
        //     bottom: Math.max(startY, mouseY),
        //     color: "red",
        //     selectedClass: selectedClass,
        //     classKey: classKey
        // }

        drawRectangleOnCanvas.drawAll();
        context.strokeStyle = "yellow";
        context.lineWidth = strokeWidth;
        context.globalAlpha = 1;
        w = mouseX - startX
        h = mouseY - startY
        context.strokeRect(startX, startY, w, h);

    },


    aj_coord_lookup: function(image) {
        rects = []
        q_image = image.substring(0, image.length - 4).split('/').reverse()[0]

        $.ajax({
            type: "GET",
            url: "/get_coords_file",
            data: {
                the_image: q_image,
                // access_token: $("#access_token").val() 
            },
            success: function(result) {
                // console.log(rects);

                j_results = JSON.parse(result)
                newRawRect = []
                newRect = {}
                // rects = []
                for (var i = 0; i < j_results.length; i++) {

                    //--- WHen server returns cv2 formated coords
                    newRawRect = drawRectangleOnCanvas.yoloCoordValuesReverter(
                        j_results[i]['x1'],
                        j_results[i]['y1'],
                        j_results[i]['x2'],
                        j_results[i]['y2']
                    )
                    newRect = {
                        left: newRawRect['x1'],
                        top: newRawRect['y1'],
                        right: newRawRect['x2'],
                        bottom: newRawRect['y2'],
                        x1: j_results[i]['x1'],
                        y1: j_results[i]['y1'],
                        x2: j_results[i]['x2'],
                        y2: j_results[i]['y2'],
                        color: "orange",
                        selectedClass: options[j_results[i]['cid']],
                        classKey: j_results[i]['cid']
                    }
                    // //--- WHen server returns cv2 formated coords
                    // newRect = {
                    //     left: j_results[i]['x1'],
                    //     right: j_results[i]['y1'],
                    //     top: j_results[i]['x2'],
                    //     bottom: j_results[i]['y2'],
                    //     color: "orange",
                    //     selectedClass: options[j_results[i]['cid']],
                    //     classKey: j_results[i]['cid']
                    // }
                    rects.push(newRect);

                }
// console.log(q_image)
// console.log(rects)
                drawRectangleOnCanvas.drawAll();
            },
            error: function(result) {
                console.log('error');
            }
        });
    },


    aj_coord_save: function(image, cur_element) {
        if( rects.length <= 0 ) {
            return
        }
        cur_element.removeClass('needsCoords');
        cur_element.addClass('hasCoords');

        console.log(`--------aj_coord_save: ${image}`);
        console.log(`aj_coord_save: ${rects.length}`);
        console.log(rects);
        q_image = image.substring(0, image.length - 4).split('/').reverse()[0]

        $.ajax({
            type: "POST",
            url: "/set_coords_file", 
            // contentType: "application/json; charset=utf-8",
            // dataType: "json",
            // data: {'boxes':rects},
            data: {
                'the_image': q_image,
                'rects': JSON.stringify(rects),
                // access_token: $("#access_token").val() 
            },
            success: function(result) {
console.log(rects);
                    return result
            },
            error: function(result) {
                console.log('error');
            }
        });
    }

}