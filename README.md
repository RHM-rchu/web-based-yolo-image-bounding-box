# web-based-yolo-image-bounding-box
Python Webserver: load images, draw bounding boxes for YOLO formated AI model training 

```
pip3 install -r requirments.txt
python3 web-server.py
```
view: host:8081/

logs in ./logs/web-server.log

### phase 1: [DONE]
  - draw one or more bounding boxes
  - delete bounding boxes with center click or click list of boxes
  - class dropdown 
  - YOLO center decimal coord convertion, then back to standar x,y from top corner


### phase 2: [DONE]
  - write YOLO txt complimentary file to image


### phase 3: [started]
  - dyamic load image **DONE**
  - UI to cycle through images


### phase 4: [started]
  - progress bar
  - jump to next model image (pickup from where we left off) **DONE**


### phase 5: [Not started]
  - review UI
  - zip model
