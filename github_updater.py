from flask import Flask, request

import json
import threading
import subprocess
import os

from sys import executable

app = Flask(__name__)

def background():
    print "======================================================================="
    print "DOWNLOADING NEW UPDATE"
    print "======================================================================="
	
    # Kill everything with the keyword 'server.js'
    subprocess.call("pkill -9 node", shell=True)

    os.chdir("/projects/PreCureChat")
	
    # Pulls latest files of GitHub
    subprocess.call("git pull origin master", shell=True)
	
    # Launches new code.
    print "======================================================================="
    print "GITHUB_UPDATER - UPDATE SUCCESSFUL"
    print "======================================================================="
    subprocess.call("npm start", shell=True)

    # Returns a code
    return 'Successful'

@app.route('/',methods=['POST'])
def foo():
    print "======================================================================="
    print "NOTICE - LOG"
    print "======================================================================="
    data = json.loads(request.data)
    print data
    #print "New commit by: {}".format(data['commits'][0]['author']['name'])
    print "======================================================================="
    return background()


def mainSetup():

    print "======================================================================="
    print "GITHUB_UPDATER - LAUNCHED"
    print "======================================================================="
    app.run(host= 'precure.ddns.net', port=6000, debug=False)

mainSetup()