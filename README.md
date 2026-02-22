Kodex Stickman Prototype

This is a small Flask prototype that demonstrates the "stickman" agent idea.

What it does:
- A stickman canvas animates on demo pages.
- Buttons and links act as "platforms".
- The stickman can visit links in the background (up to two concurrently). Visits are simulated using hidden iframes.
- When a background visit finishes, the demo sends a POST `/api/notify` to the server (prints to console).

How to run (Windows PowerShell):

```powershell
cd kodex-ai
python -m pip install flask
python app.py
```

Open `http://127.0.0.1:5002/` in your browser and try the demo pages.

Notes:
- This is a frontend prototype — it simulates background visits and simple notifications.
- For a full product you'd add authentication, persistent state, real OS notifications, and richer agent behaviors.
