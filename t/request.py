#!/usr/bin/env python
import requests 
import sys

path = sys.argv[1] if len(sys.argv) >= 2 else ''
URL = "http://localhost:5000/{0}".format(path)
r = requests.get(url = URL)
data = r.json() 
print(data) 