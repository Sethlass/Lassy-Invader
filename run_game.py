import http.server
import socketserver
import webbrowser
import os

PORT = 8000

# Directory to serve files from
web_dir = os.path.join(os.path.dirname(__file__))
os.chdir(web_dir)

# Start the server
handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(("", PORT), handler) as httpd:
    print(f"Serving at port {PORT}")
    
    # Adjust the path to Chrome based on the system environment
    chrome_path = "C:/Program Files/Google/Chrome/Application/chrome.exe"
    
    # Ensure that the path exists before attempting to open Chrome
    if os.path.exists(chrome_path):
        webbrowser.get(f'"{chrome_path}" %s').open(f"http://localhost:{PORT}/index.html")
    else:
        print("Chrome path not found. Please ensure the path is correct.")
    
    httpd.serve_forever()
