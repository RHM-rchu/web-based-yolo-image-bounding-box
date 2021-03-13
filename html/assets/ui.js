// all this work just to be able to high enter to select first element in filter
var input = document.querySelector("input");
var options = $.map($('#checkName option'), function(option) {
    return option.value;
});
input.addEventListener('keypress', function(e) {
    if (e.keyCode == 13) {
        var relevantOptions = options.filter(function(option) {
            return option.toLowerCase().includes(input.value.toLowerCase());
        }); // filtering the data list based on input query
        if (relevantOptions.length > 0) {
            input.value = relevantOptions.shift(); //Taking the first
        }
    }
});
$(".imagelist").on('click', function(event) {
    var cur_element = $(this);
    var new_image = cur_element.text();

    var cur_image = $('#image_list ol li.active').text();
    drawRectangleOnCanvas.aj_coord_save(cur_image, cur_element);

    $('.active').removeClass('active');
    $(this).addClass('active');
    show_next_prev_or_not();
    drawRectangleOnCanvas.loadImage(new_image);

});
$('input#button_save').on('click', function(event) {
    save_current_img_coords();
});
$('div.next_img').on('click', function(event) {
    show_next_image();
});
$('div .prev_img').on('click', function(event) {
    show_prev_image();
});


function show_next_image() {
    var cur_element = $('#image_list ol li.active');
    var new_image = cur_element.closest('li').next('li').text();
    if(new_image == "") {
        console.log('No more images')
        return 
    }
    var cur_image = cur_element.text();
    drawRectangleOnCanvas.aj_coord_save(cur_image, cur_element);

    var nextImg = cur_element.closest('li').next('li');
    var nextImgLiNum = cur_element.closest('li').next('li').index();

    $('.active').removeClass('active');
    nextImg.addClass('active');
    show_next_prev_or_not();
    drawRectangleOnCanvas.loadImage(new_image);
}
function show_prev_image() {
    var cur_element = $('#image_list ol li.active');
    var new_image = cur_element.closest('li').prev('li').text();
    if(new_image == "") {
        console.log('No more images')
        return 
    }
    var cur_image = cur_element.text();
    drawRectangleOnCanvas.aj_coord_save(cur_image, cur_element);

    var prevImg = cur_element.closest('li').prev('li');
    var prevImgLiNum = cur_element.closest('li').prev('li').index();

    $('.active').removeClass('active');
    prevImg.addClass('active');
    show_next_prev_or_not();
    drawRectangleOnCanvas.loadImage(new_image);
}
function save_current_img_coords() {
    var cur_element = $('#image_list ol li.active');
    var cur_image = cur_element.text();
    drawRectangleOnCanvas.aj_coord_save(cur_image, cur_element, 1);
    show_next_prev_or_not();
}
//---- show/hide - next prev
function show_next_prev_or_not() {

    // var curnImgNum = $('#image_list ol li.active').index();
    // var nextImg = $('#image_list ol li.active').closest('li').next('li').text();
    // var prevtImg = $('#image_list ol li.active').closest('li').prev('li').text();
    var cur_element = $('#image_list ol li.active');
    var nextImgNum = cur_element.closest('li').next('li').index();
    var prevImgNum = cur_element.closest('li').prev('li').index();

    if(cur_element.text() === "") {
        var curnImgNum = $('#image_list ol li').length;
        $( "#image_list ol li:nth-child(" + curnImgNum +")" ).addClass('active')
    }

    if (prevImgNum >= 0 || curnImgNum > 0) {
        $("div #prev_img").show();
    } else {
        $("div #prev_img").hide();
    }
    if (nextImgNum < 0) {
        $("div #next_img").hide();
    } else {
        $("div #next_img").show();
    }

    ttl_images = $('#image_list ol li').length;
    cmplt_images = $('#image_list ol li.hasCoords').length;
    need_images = $('#image_list ol li.needsCoords').length;
    percent_complete = (cmplt_images / ttl_images * 100).toFixed(2);
    $('#drawboxstatus').attr('value', percent_complete);
    $('#drawboxstatus').attr('data-label', cmplt_images + " of " + ttl_images);
    // $('#drawboxstatus').text(cmplt_images + " of " + ttl_images );
    // $('progress#drawboxstatus').before(cmplt_images + " of " + ttl_images + "<br>");
    // (cmplt_images + " of " + ttl_images + "<br>").insertbefore('progress#drawboxstatus')
}




//---- Keyboard controls
$('#container').on('keydown', function(e) {

    switch (e.keyCode) {
        case 68: //'d' = advance image
        case 39: //arrow '->' 
            show_next_image();
            break;
        case 65: //'a' = previous image
        case 37: //'<-' arrow
            show_prev_image();
            break;
        case 83: //'s' = save
            save_current_img_coords();
            break;
        default:
            console.log("key: " + e.keyCode);
    }
});

//---- Left nav toggle show/hide
var coll = document.getElementsByClassName("collapsible");
var i;
for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        var content = this.nextElementSibling;
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}
