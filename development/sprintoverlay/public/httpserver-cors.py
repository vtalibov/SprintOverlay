# Python script to launch http.server with relaxed CORS policies; otherwise the app
# does not read local files or have restrictions to get files online.

from http.server import SimpleHTTPRequestHandler, HTTPServer

class CORSRequestHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Origin, Content-Type')
        SimpleHTTPRequestHandler.end_headers(self)

if __name__ == '__main__':
    try:
        server_address = ('', 8000)
        httpd = HTTPServer(server_address, CORSRequestHandler)
        print('Server started at http://localhost:8000')
        httpd.serve_forever()
    except KeyboardInterrupt:
        print('Server stopped.')