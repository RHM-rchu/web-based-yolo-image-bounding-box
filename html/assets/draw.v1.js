var canvas = document.getElementById('canvasarea');
var ctx = canvas.getContext('2d');
var rect = {};
var drag = false;
var imageObj = null;

function init() {
    imageObj = new Image();
    imageObj.onload = function () { 
        // ctx.drawImage(imageObj, 0, 0); 
        img = imageObj

        canvas.width  = img.width;    
        canvas.height = img.height;  

        ctx.drawImage(img, 0,0);
        loadRect();

    };
    imageObj.src = image_path;
    // imageObj.src = '/media/images/2021/03/01/car_at_20210301_105244.jpg';
    canvas.addEventListener('mousedown', mouseDown, false);
    canvas.addEventListener('mouseup', mouseUp, false);
    canvas.addEventListener('mousemove', mouseMove, false);
}

function mouseDown(e) {
   btnCode = e.button;

    switch (btnCode) {
        case 0:
            console.log('Left button clicked.');
        break;

        case 1:
            console.log('Middle button clicked.');
        break;

        case 2:
            console.log('Right button clicked.');
        break;

        default:
            console.log('Unexpected code: ' + btnCode);
    }
    rect.startX = e.pageX - this.offsetLeft;
    rect.startY = e.pageY - this.offsetTop;
    drag = true;

    // begin_xy = rect.startX + ',' + rect.startY
    // document.getElementById('begin_xy').value = begin_xy;
    console.log( '------- Reset ------- '  );
    // console.log( 'Start: ' + document.getElementById('begin_xy').value );
}

function mouseUp(e) { 
    rect.endX = e.pageX - this.offsetLeft;
    rect.endY = e.pageY - this.offsetTop;
    rect.w = rect.endX - rect.startX;
    rect.h = rect.endY - rect.startY;
    drag = false; 

    end_xy = rect.endX + ',' + rect.endY 
}

function mouseMove(e) {
    if (drag) {
        rect.endX = (e.pageX - this.offsetLeft)
        rect.endY = (e.pageY - this.offsetTop)

        ctx.clearRect(0, 0, 500, 500);
        ctx.drawImage(imageObj, 0, 0);
        rect.w = rect.endX - rect.startX;
        rect.h = rect.endY - rect.startY;
        ctx.strokeStyle = 'red';
        ctx.strokeRect(rect.startX, rect.startY, rect.w, rect.h);


        document.getElementById('coords').innerHTML =  '<dl class="calibrate new">'
            + "    <dt>NEW</dt>"
            + "    <dd>(x)" + ((rect.startX > 0) ? rect.startX : 0 ) 
            + " (y) " + ((rect.startY > 0) ? rect.startY : 0 ) 
            + " - upper </dd>"
            + "    <dd>(x)" + ((rect.endX > 0) ? rect.endX : 0 ) 
            + " (y) " + ((rect.endY > 0) ? rect.endY : 0 ) 
            + " - lower </dd>"
            + "    <dd>(w) " + ((rect.w > 0) ? rect.w : 0 ) 
            + " (h) " +  ((rect.h > 0) ? rect.h : 0 )  +"</dd>"
            + "</dl>";

    }
    loadRect();
}
function loadRect() {
    // if( ${upper_left_x} > 0 ) {
    //     ctx.strokeStyle = 'rgba(255, 255, 0, 1)';
    //     ctx.lineWidth = 4
    //     ctx.strokeRect(${upper_left_x}, ${upper_left_y}, ${width}, ${height});
    // }
}
//

$( document ).ready(function() {
    init();
// % if upper_left_x is UNDEFINED:
//     loadRect();
// % endif
});