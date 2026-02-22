from flask import Flask, render_template, request, jsonify
import threading
import requests
import time
import os

app = Flask(__name__, static_folder='static', template_folder='templates')


# Demo in-memory storage (not persistent)
MESSAGES = []


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/demo/<int:page_id>')
def demo(page_id):
    # simple demo page with some links (could be external)
    links = [f'/demo/{i}' for i in range(1, 6) if i != page_id]
    return render_template('demo_page.html', page_id=page_id, links=links)


@app.route('/api/notify', methods=['POST'])
def api_notify():
    data = request.json or {}
    print('Notification:', data)
    return jsonify({'ok': True}), 200


@app.route('/api/proxy', methods=['POST'])
def api_proxy():
    """Fetch a URL server-side and return its text (demo only)."""
    data = request.json or {}
    url = data.get('url')
    if not url:
        return jsonify({'error': 'no url'}), 400
    try:
        resp = requests.get(url, timeout=5)
        text = resp.text[:20000]
        return jsonify({'ok': True, 'text': text, 'status_code': resp.status_code}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/api/task', methods=['POST'])
def api_task():
    """Simple demo task endpoint. In a real app this would call an AI backend.
    Supported types: essay, analyze_image, summarize
    """
    data = request.json or {}
    t = data.get('type')
    payload = data.get('payload') or ''
    page = data.get('page') or ''

    if t == 'essay':
        topic = payload or 'A short topic'
        essay = f"(mock essay about {topic})\n\nThis is a demo essay. Replace /api/task with your real AI integration."
        return jsonify({'ok': True, 'result': essay}), 200
    elif t == 'analyze_image':
        url = payload.strip()
        analysis = f"(mock analysis) Provided image URL: {url or '(none)'}\nDetected: person, background, object"
        return jsonify({'ok': True, 'result': analysis}), 200
    elif t == 'summarize':
        # basic server-side summarize: return first N chars of page if a proxy url provided
        text = ''
        if payload and payload.startswith('http'):
            try:
                r = requests.get(payload, timeout=4)
                text = r.text[:2000]
            except Exception as e:
                text = f'failed to fetch: {e}'
        else:
            # fallback to page param (not fetching) - echo
            text = f'Mock summary for page {page} (no fetch)'
        return jsonify({'ok': True, 'result': text}), 200
    else:
        return jsonify({'error': 'unknown task type'}), 400


@app.route('/api/messages', methods=['GET', 'POST'])
def api_messages():
    global MESSAGES
    if request.method == 'POST':
        data = request.json or {}
        data['id'] = int(time.time()*1000)
        MESSAGES.insert(0, data)
        return jsonify({'ok': True, 'message': data}), 201
    else:
        return jsonify({'ok': True, 'messages': MESSAGES}), 200


def run():
    app.run(port=5002, debug=True)


if __name__ == '__main__':
    run()
