from flask import Flask, request

import json
import threading
import subprocess
import os

from sys import executable

app = Flask(__name__)

def background():
    print "DOWNLOADING NEW UPDATE"
    # Kill everything with the keyword 'server.js'
    os.system("pkill -9 server.js")
    os.system("pkill -9 node")

    os.chdir("/projects/PreCureChat")

    return_code = subprocess.call("sudo git pull origin master", shell=True)

    subprocess.Popen(["npm", "start"])

    return 'up-to-date'

@app.route('/',methods=['POST'])
def foo():
    data = json.loads(request.data)
    print data
#print "New commit by: {}".format(data['commits'][0]['author']['name'])
    return background()


def mainSetup():
    app.run(host= 'precure.ddns.net', port=6000, debug=False)

mainSetup()