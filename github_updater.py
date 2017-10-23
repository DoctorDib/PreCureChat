from flask import Flask, request

import json
import threading
import subprocess
import os

from sys import executable

app = Flask(__name__)

users=['DoctorDib', 'MidgetJake']

def update_server(name):
    # Checks commited username pull.
    if name in str(users):
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
        subprocess.Popen("node", "server.js", ">", "out.log", "&", "disown")

        # Returns a code
        return 'Successful'
    else:
        return 'User authentication denied'

@app.route('/',methods=['POST'])
def foo():
    print "======================================================================="
    print "NOTICE - LOG"
    print "======================================================================="

    data = json.loads(request.data)

    print "Name: {}".format(data['commits'][0]['author']['name'])
    print "Username: {}".format(data['commits'][0]['author']['username'])
    print "Email: {}".format(data['commits'][0]['author']['email'])
    print "-------------------------------------------------------------"
    print "URL: {}".format(data['commits'][0]['url'])
    print "Message: {}".format(data['commits'][0]['message'])
    print "Date/Time: {}".format(data['commits'][0]['timestamp'])
    print "-------------------------------------------------------------"
    print "Added: {}".format(data['commits'][0]['added'])
    print "-------------------------------------------------------------"
    print "Removed: {}".format(data['commits'][0]['removed'])
    print "-------------------------------------------------------------"
    print "Modified: {}".format(data['commits'][0]['modified'])

    name = data['commits'][0]['author']['username']

    return update_server(name)

def mainSetup():
    update_server('DoctorDib')
    print "======================================================================="
    print "GITHUB_UPDATER - LAUNCHED"
    print "======================================================================="
    app.run(host= 'precure.ddns.net', port=6000, debug=False)

mainSetup()
