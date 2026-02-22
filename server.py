import http.server
import json
import os

PORT = 5000
QUERIES_FILE = 'student_queries.txt'

class QueryHandler(http.server.BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_POST(self):
        if self.path == '/api/submit-query':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            query = json.loads(post_data.decode('utf-8'))

            log_entry = f"""
-----------------------------------------
ID: {query.get('id')}
Timestamp: {query.get('timestamp')}
Name: {query.get('name')}
Email: {query.get('email')}
Subject: {query.get('subject')}
Message:
{query.get('message')}
-----------------------------------------
\n"""
            with open(QUERIES_FILE, 'a', encoding='utf-8') as f:
                f.write(log_entry)

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            response = {'success': True, 'message': 'Query saved to text file'}
            self.wfile.write(json.dumps(response).encode('utf-8'))

if __name__ == '__main__':
    server = http.server.HTTPServer(('localhost', PORT), QueryHandler)
    print(f"Server is running on http://localhost:{PORT}")
    print(f"User queries will be saved to: {os.path.abspath(QUERIES_FILE)}")
    server.serve_forever()
