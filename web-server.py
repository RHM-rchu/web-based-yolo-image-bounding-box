# from http.server import BaseHTTPRequestHandler, HTTPServer
import http.server
import json
import base64
import datetime, time, os, sys, json
import re
# import cv2
import cgi, io, shutil
import zipfile

import subprocess, socketserver

import socketserver
from urllib.parse import urlparse, parse_qs
from mako.template import Template

WEB_REQURE_AUTH = True
WEB_USERNAME = "user"
WEB_PASSWORD = "pass"
SERVERPORT = 8081
HOSTNAME = ""
TRAINING_PATH = "training"
TRAINING_PROJECT = ""
TRAINING_PROJECT_PATH = ""
LOG_FILE_WEB = "logs/web-server.log"

#--- log to file
if 'LOG_FILE_WEB' in locals():
    logfile_base = os.path.dirname(os.path.abspath(LOG_FILE_WEB))
    os.makedirs(logfile_base, exist_ok=True)
    logfile = open(LOG_FILE_WEB,'w', 1)
    sys.stdout = logfile
    sys.stdin = logfile
    sys.stderr = logfile


def revert_labels(path, label_path):

    img = cv2.imread(path)
    # try:
    #     return img.shape
    # except AttributeError:
    #     print('error! ', path)
    #     return (None, None, None)

    dh, dw, _ = img.shape

    if not os.path.isfile(label_path):
        return []

    fl = open(label_path, 'r')
    data = fl.readlines()
    fl.close()

    imgBoxes = []
    for dt in data:
        # Split string to float
        cid, x, y, w, h = map(float, dt.split(' '))

        # Taken from https://github.com/pjreddie/darknet/blob/810d7f797bdb2f021dbe65d2524c2ff6b8ab5c8b/src/image.c#L283-L291
        # via https://stackoverflow.com/questions/44544471/how-to-get-the-coordinates-of-the-bounding-box-in-yolo-object-detection#comment102178409_44592380
        l = int((x - w / 2) * dw)
        r = int((x + w / 2) * dw)
        t = int((y - h / 2) * dh)
        b = int((y + h / 2) * dh)
        
        if l < 0:
            l = 0
        if r > dw - 1:
            r = dw - 1
        if t < 0:
            t = 0
        if b > dh - 1:
            b = dh - 1
        imgBoxes.append(
            {
            'cid': int(cid),
            'x1': l,
            'x2': t,
            'y1': r,
            'y2': b,
            }
            )
    return imgBoxes


def convert_labels(path, x1, y1, x2, y2):
    """
    https://blog.goodaudience.com/part-1-preparing-data-before-training-yolo-v2-and-v3-deepfashion-dataset-3122cd7dd884
    Definition: Parses label files to extract label and bounding box
        coordinates.  Converts (x1, y1, x1, y2) KITTI format to
        (x, y, width, height) normalized YOLO format.
    """

    img = cv2.imread(path)
    try:
        return img.shape
    except AttributeError:
        print('error! ', path)
        return (None, None, None)

    def sorting(l1, l2):
        if l1 > l2:
            lmax, lmin = l1, l2
            return lmax, lmin
        else:
            lmax, lmin = l2, l1
            return lmax, lmin
    size, _ = img.shape
    xmax, xmin = sorting(x1, x2)
    ymax, ymin = sorting(y1, y2)
    dw = 1./size[1]
    dh = 1./size[0]
    x = (xmin + xmax)/2.0
    y = (ymin + ymax)/2.0
    w = xmax - xmin
    h = ymax - ymin
    x = x*dw
    w = w*dw
    y = y*dh
    h = h*dh
    return (x,y,w,h)



# -----------------------------------------
def set_coords_file(query_components={}):
    if 'the_image' in query_components:
        print("-------------------")
        print(query_components)
        the_image = query_components["the_image"][0]
        base_name = os.path.basename(the_image)
        coord_file = f"{TRAINING_PROJECT_PATH}/{base_name}.txt"
        # query_components.pop("the_image")
        # print(f"{base_name} --> {coord_file}")

        line = ""
        if 'rects' in query_components:
            rects = json.loads(query_components['rects'][0].replace("'", ""))
            cnt_rects = len(rects)
            if cnt_rects <= 0:
                try:
                    print(f"[DELELETE] coord file: {coord_file}")
                    os.remove(coord_file)
                except OSError:
                    return
            else:
                for i, val in enumerate(rects):
                    # all('' in e  for e in val )
                    for e in ['left', 'right', 'top', 'bottom', 'color', 'selectedClass']: 
                        if e in val: val.pop(e) 
                    if bool(len(['' for x in val.values() if x == ""])): 
                        continue

                    line += f"{val['classKey']} {val['x1']} {val['y1']} {val['x2']} {val['y2']}\n"
                with open(coord_file, 'w+') as f:
                    f.write(line)



def get_coords_file(self, query_components={}):
    if 'the_image' in query_components:
        the_image = query_components["the_image"][0]
        base_name = os.path.basename(the_image)
        coord_file = f"{TRAINING_PROJECT_PATH}/{base_name}.txt"

    cv2_coords = []
    if os.path.isfile(coord_file):
        with open (coord_file, "r") as myfile:
            coord_data = myfile.readlines()
            coord_data = [s.rstrip() for s in coord_data]
            for s in coord_data:
                chunks = s.split(' ')
                cv2_coords.append(
                    {
                    'cid': chunks[0],
                    'x1': chunks[1],
                    'y1': chunks[2],
                    'x2': chunks[3],
                    'y2': chunks[4],
                    }
                )

    # cv2_coords2 = revert_labels(f"{TRAINING_PROJECT_PATH}/{base_name}.jpg", f"{TRAINING_PROJECT_PATH}/{base_name}.txt")
    # print(cv2_coords2)
    # print('--------------------cv2_coords')
    # print(cv2_coords)

    self.send_header('Content-type', 'application/json')
    self.end_headers()
    self.wfile.write(bytes(json.dumps(cv2_coords), "utf-8"))

    return 

def getSet_projects(project=''):
    global TRAINING_PROJECT

    if project != '':
        TRAINING_PROJECT = project

    dirs = os.listdir(TRAINING_PATH)
    dirLists = []
    for f in dirs:
        if os.path.isdir(f"{TRAINING_PATH}/{f}"):
            if TRAINING_PROJECT == "":
                TRAINING_PROJECT = f
            dirLists.append(f)
    return dirLists

# -----------------------------------------
def render_html_homepage(query_components=None):
    classesFile = f"{TRAINING_PROJECT_PATH}/classes.txt"

    # jpg_files = [f for f in os.listdir(TRAINING_PROJECT_PATH) if f.endswith('.jpg')]
    files = os.listdir(TRAINING_PROJECT_PATH)
    files.sort()
    imageLists = {}
    class_data = []

    dirLists = getSet_projects()

    for f in files:
        if f.endswith( '.zip' ) or f.startswith( '__MAC' ) or f.startswith( '.' ) or f == 'classes.txt':
            continue
        elif os.path.isdir(f"{TRAINING_PROJECT_PATH}/{f}"): 
            continue

        reFile = re.search(r'(.*)\.([a-z]{3,4})', f)

        if reFile == None:
            continue

        if reFile[1] not in imageLists:
            imageLists[reFile[1]] = {
                'image_path': '',
                'txt_path': '',
            }
        if reFile[2] == "txt":
            imageLists[reFile[1]]['txt_path'] = f'{TRAINING_PROJECT_PATH}/{reFile[0]}'
        elif re.search("jpg|jpeg|png|gif|bmp|raw", reFile[2]):
            imageLists[reFile[1]]['image_path'] = f'{TRAINING_PROJECT_PATH}/{reFile[0]}'


    if os.path.isfile(classesFile):
        with open (classesFile, "r") as myfile:
            class_data = myfile.readlines()
            class_data = [s.rstrip() for s in class_data]


    htmllist = Template(filename='html/_home.html')
    html = htmllist.render(
        imageLists=imageLists,
        class_data=class_data,
        training_project=TRAINING_PROJECT,
        dirLists=dirLists,
        )
    return html



#-----------------------------------------
# web header and handles
#-----------------------------------------

def send_img(self, filename_rel, mimetype):
    #Open the static file requested and send it
    f = open(filename_rel) 
    self.send_response(200)
    self.send_header('Content-type',mimetype)
    self.end_headers()
    self.wfile.write(f.read())
    f.close()

def content_type(filename_rel):
    ext2conttype = {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "gif": "image/gif"
        }
    return ext2conttype[filename_rel[filename_rel.rfind(".")+1:].lower()]

class theWebServer(http.server.BaseHTTPRequestHandler):
    def do_AUTHHEAD(self):
        self.send_response(401)
        self.send_header(
            'WWW-Authenticate', 'Basic realm="Auth Realm"')
        self.send_header('Content-type', 'application/json')
        self.end_headers()


    def upload_post_data(self):
        fields = cgi.FieldStorage(
            fp=self.rfile,
            headers=self.headers,
            environ={'REQUEST_METHOD':'POST'}
            )
        base_dir = ""

        try:
            if isinstance(fields['file'], list):
                for f in fields['file']:
                    base_dir, extention = f.filename.rsplit('.', 1)
                    self.upload_prep_move(f)
            else:
                f = fields['file']
                self.upload_prep_move(f)

            return "Success"
        except IOError:
            return "Can't create file to write, do you have permission to write?"

    def upload_prep_move(self, f):
        base_dir, extention = f.filename.rsplit('.', 1)
        base_dir_full = f"{TRAINING_PATH}/{base_dir}"
        print("[1UPLOADED] file: {f.filename}")
        self.save_file(f, base_dir_full)

        print(f"[MOOOO]--------{extention}")
        if extention == 'zip':
            zipfile_path = f"{base_dir_full}/{f.filename}"
            with zipfile.ZipFile(zipfile_path, 'r') as zip_ref:
                zip_ref.extractall(base_dir_full + '/')

                if os.path.isfile(zipfile_path):
                    os.remove(zipfile_path)

                mac_path = f"{base_dir_full}/__MACOSX"
                if  os.path.isdir(mac_path):
                    shutil.rmtree(mac_path)

                classes_path = f"{base_dir_full}/classes.txt"
                if not os.path.isfile(classes_path):
                    shutil.copy(f"{TRAINING_PATH}/classes.txt", f"{base_dir_full}/")


    def save_file(self, file, base_dir_full):
        print(f"[SAVING] file: {base_dir_full}/{file.filename}")
        os.mkdir(f"{base_dir_full}")
        outpath = os.path.join(f"{base_dir_full}", file.filename)
        with open(outpath, 'wb') as fout:
            shutil.copyfileobj(file.file, fout, 100000)


    def do_POST(self):
        global TRAINING_PROJECT, TRAINING_PROJECT_PATH
        #------------ userauth
        if WEB_REQURE_AUTH == True:
            key = self.server.get_auth_key()

            ''' Present frontpage with user authentication. '''
            if self.headers.get('Authorization') == 'Basic ' + str(key):
                getvars = self._parse_GET()

                response = {
                    'path': self.path,
                    'get_vars': str(getvars)
                }

            else:
                self.do_AUTHHEAD()

                response = {
                    'success': False,
                    'error': 'Invalid credentials'
                }

                self.wfile.write(bytes(json.dumps(response), 'utf-8'))
                return None



        # self.send_response(301)
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()

        length = int(self.headers['Content-Length'])
        html_body = None
        
        if self.path.startswith('/set_coords_file'):
            fields = parse_qs(self.rfile.read(length).decode('utf-8'))

            if 'project' in fields:
                getSet_projects(fields['project'])
            else:
                getSet_projects()

            html_body = set_coords_file(
                query_components=fields,
                )
            return 
        elif self.path.startswith('/upload_file'):
            ###### option 0
            html_body = self.upload_post_data()
            self.wfile.write(bytes(html_body, "utf-8"))
            return  


        htmlwrapper = Template(filename='html/wrapper.html')
        html = htmlwrapper.render(
            body=html_body,
            )

        self.wfile.write(bytes(html, "utf-8"))

    def do_GET(self):
        global TRAINING_PROJECT, TRAINING_PROJECT_PATH

        #------------ userauth
        if WEB_REQURE_AUTH == True:
            key = self.server.get_auth_key()

            ''' Present frontpage with user authentication. '''
            if self.headers.get('Authorization') == 'Basic ' + str(key):
                getvars = self._parse_GET()

                response = {
                    'path': self.path,
                    'get_vars': str(getvars)
                }

            else:
                self.do_AUTHHEAD()

                response = {
                    'success': False,
                    'error': 'Invalid credentials'
                }

                self.wfile.write(bytes(json.dumps(response), 'utf-8'))
                return None

        path = self.path
        if '?' in self.path:
             path = self.path.split('?')[0]
        print("-----" + path)

        filename =  path
        filename_rel = filename.strip('/')
        send_asset = False


        self.send_response(200)
        if filename[-4:] == '.html':
            self.send_header('Content-type', 'text/html')
            send_asset = True
        elif filename[-4:] == '.css':
            self.send_header('Content-type', 'text/css')
            send_asset = True
        elif filename[-5:] == '.json':
            self.send_header('Content-type', 'application/javascript')
            send_asset = True
        elif filename[-3:] == '.js':
            self.send_header('Content-type', 'application/javascript')
            send_asset = True
        elif filename[-4:] == '.ico':
            self.send_header('Content-type', 'image/x-icon')
        elif filename.endswith(".jpg") or filename.endswith(".gif") or filename.endswith(".png"):
            contenttype = content_type(filename_rel)
            self.send_header('Content-type', contenttype)
            send_asset = True
        else:
            self.send_header('Content-type', 'text/html')
            send_asset = False


        # ignore request to favicon
        if self.path.endswith('favicon.ico'):
            self.end_headers()
            return
        elif send_asset or self.path.startswith('/html/assets/') or self.path.startswith(f'/{TRAINING_PATH}/'):
            print("-----" + path)
            self.end_headers()
            with open(filename_rel, 'rb') as fh:
                html = fh.read()
                self.wfile.write(html)
                return
        else:

            query_string = urlparse(self.path).query
            query_components = parse_qs(query_string)


            if 'project' not in query_components:
                getSet_projects()
            else:
                TRAINING_PROJECT = query_components['project'][0]
            TRAINING_PROJECT_PATH = f"{TRAINING_PATH}/{TRAINING_PROJECT}"

            html_body = ""
            if self.path.startswith('/get_coords_file'):
                get_coords_file(
                    query_components=query_components,
                    self=self,
                    )
                return
            else:
                html_body = render_html_homepage(
                    query_components=query_components,
                    )

            self.end_headers()
            htmlwrapper = Template(filename='html/wrapper.html')
            html = htmlwrapper.render(
                body=html_body,
                )

            self.wfile.write(bytes(html, "utf-8"))

    def _parse_GET(self):
        getvars = parse_qs(urlparse(self.path).query)

        return getvars


class CustomHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    key = ''

    def __init__(self, address, handlerClass=theWebServer):
        super().__init__(address, handlerClass)

    def set_auth(self, username, password):
        self.key = base64.b64encode(
            bytes('%s:%s' % (username, password), 'utf-8')).decode('ascii')

    def get_auth_key(self):
        return self.key


if __name__ == "__main__":        
    webServer = CustomHTTPServer(('', SERVERPORT))
    if WEB_REQURE_AUTH == True: webServer.set_auth(WEB_USERNAME, WEB_PASSWORD)
    print("Server started http://%s:%s" % (HOSTNAME, SERVERPORT))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")