import urllib.request
import json
import ssl

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

try:
    # We need a token. We can bypass auth or just run the backend function and print its JSON representation.
    pass
except Exception as e:
    print(e)
