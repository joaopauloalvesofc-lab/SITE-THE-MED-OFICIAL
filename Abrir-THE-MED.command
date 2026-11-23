#!/bin/zsh
cd -- "${0:A:h}" || exit 1
exec /usr/bin/python3 - <<'PY'
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import webbrowser


class Site(SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        if code != 404:
            return super().send_error(code, message, explain)
        page = Path("404.html").read_bytes()
        self.send_response(404)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(page)))
        self.end_headers()
        if self.command != "HEAD":
            self.wfile.write(page)


with ThreadingHTTPServer(("127.0.0.1", 0), Site) as server:
    url = f"http://127.0.0.1:{server.server_port}/"
    print(f"THE MED está em {url}\nPara encerrar, pressione Control+C.", flush=True)
    webbrowser.open(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
PY
