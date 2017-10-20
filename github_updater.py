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
    os.system("sudo pkill -9 node")

    os.chdir("/projects/PreCureChat")
	
	# Pulls latest files of GitHub
    return_code = subprocess.call("sudo git pull origin master", shell=True)
	
	# Launches new code.
	print "======================================================================="
    print "GITHUB_UPDATER - UPDATE SUCCESSFUL"
	print "======================================================================="
    os.system("npm start")

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
	os.system("npm start")
	print "======================================================================="
    print "GITHUB_UPDATER - LAUNCHED"
	print "======================================================================="
    app.run(host= 'precure.ddns.net', port=6000, debug=False)

mainSetup()