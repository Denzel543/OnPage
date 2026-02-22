window.addEventListener("DOMContentLoaded", () => {

  // ==== CONFIG ====
  const stickmanSize = 8;
  const stickmanColor = "orange";
  const idleInterval = 300;
  const gravity = 0.5;
  const jumpPower = -6;
  const dropPower = 4;
  const moveSpeed = 1.2;
  const cursorHangDist = 40;
  const respawnOffset = 100;

  // ==== STORAGE (In-memory replacement for localStorage) ====
  window.stickmanData = window.stickmanData || {
    slots: [],
    positions: {},
    visitedLinks: [],
    pageAssignments: {} // Maps stickman ID to current page URL
  };

  const storage = window.stickmanData;

  function getSlots() {
    return storage.slots || [];
  }

  function saveSlots(slots) {
    storage.slots = slots;
  }

  function addToSlot(stickmanId) {
    const slots = getSlots();
    if (!slots.includes(stickmanId)) slots.push(stickmanId);
    saveSlots(slots);
  }

  function removeFromSlot(stickmanId) {
    let slots = getSlots();
    slots = slots.filter(id => id !== stickmanId);
    saveSlots(slots);
  }

  function markVisitedLink(url) {
    let links = storage.visitedLinks || [];
    if (!links.includes(url)) links.push(url);
    storage.visitedLinks = links;
  }

  function setStickmanPage(stickmanId, pageUrl) {
    storage.pageAssignments[stickmanId] = pageUrl;
  }

  function getStickmanPage(stickmanId) {
    return storage.pageAssignments[stickmanId];
  }

  function isStickmanOnCurrentPage(stickmanId) {
    const assignedPage = getStickmanPage(stickmanId);
    return !assignedPage || assignedPage === window.location.href;
  }

  markVisitedLink(window.location.href);

  // ==== CANVAS ====
  const canvas = document.createElement("canvas");
  canvas.id = "stickmanCanvas";
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.pointerEvents = "none";
  canvas.style.zIndex = "9999";
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  // ==== CURSOR ====
  const cursor = { x: 0, y: 0 };
  window.addEventListener("mousemove", e => {
    cursor.x = e.pageX;
    cursor.y = e.pageY;
  });

  window.addEventListener("mousedown", () => stickmen.forEach(sm => sm.hanging = true));
  window.addEventListener("mouseup", () => stickmen.forEach(sm => sm.hanging = false));

  // ==== STICKMAN CLASS ====
  class Stickman {
    constructor(id, x=50, y=50) {
      this.id = id;
      this.x = x;
      this.y = y;
      this.size = stickmanSize;
      this.dx = moveSpeed;
      this.dy = 0;
      this.direction = 1;
      this.onGround = false;
      this.walkingFrame = 0;
      this.idleState = "walking";
      this.idleTimer = 0;
      this.hanging = false;
      this.visible = true;
      this.taskQueue = [];
      this.onLink = false;
      this.currentLink = null;
      this.currentPage = window.location.href;
      this.directionChangeDelay = 0;
      this.lastSurface = null;
      
      // Speech bubble functionality
      this.speechBubble = null;
      this.speechTimer = 0;
      this.lastSpeechTime = 0;
      this.nextSpeechDelay = this.getRandomSpeechDelay();
      
      // Link visiting
      this.visitQueue = [];
      this.isVisiting = false;
    }

    getRandomSpeechDelay() {
      return 60000 + Math.random() * 120000; // 1-3 minutes
    }

    savePosition() {
      const positionKey = "stickman_position_" + this.id;
      storage.positions[positionKey] = {
        x: this.x, 
        y: this.y, 
        direction: this.direction, 
        idleState: this.idleState,
        page: this.currentPage
      };
    }

    loadPosition() {
      const positionKey = "stickman_position_" + this.id;
      const data = storage.positions[positionKey] || {};
      if (data.x !== undefined) this.x = data.x;
      if (data.y !== undefined) this.y = data.y;
      if (data.direction !== undefined) this.direction = data.direction;
      if (data.idleState) this.idleState = data.idleState;
      if (data.page) this.currentPage = data.page;
    }

    getPageText() {
      const textNodes = [];
      const walker = document.createTreeWalker(
        document.body, 
        NodeFilter.SHOW_TEXT, 
        {
          acceptNode: function(node) {
            const parent = node.parentElement;
            if (parent && ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
              return NodeFilter.FILTER_REJECT;
            }
            if (node.textContent.trim().length > 3) {
              return NodeFilter.FILTER_ACCEPT;
            }
            return NodeFilter.FILTER_REJECT;
          }
        }, 
        false
      );
      
      let node;
      while ((node = walker.nextNode())) {
        const text = node.textContent.trim();
        if (text.length > 3) {
          textNodes.push(text);
        }
      }
      return textNodes;
    }

    getRandomTextSnippet() {
      const textNodes = this.getPageText();
      if (textNodes.length === 0) return "Nothing interesting to say...";
      
      const randomText = textNodes[Math.floor(Math.random() * textNodes.length)];
      const maxLength = 60;
      const minLength = 20;
      
      if (randomText.length <= maxLength) {
        return randomText;
      }
      
      const startPos = Math.max(0, Math.random() * (randomText.length - maxLength));
      let snippet = randomText.slice(startPos, startPos + maxLength);
      
      const lastSpace = snippet.lastIndexOf(' ');
      if (lastSpace > minLength) {
        snippet = snippet.slice(0, lastSpace);
      }
      
      return snippet.trim() + (snippet.length < randomText.length ? "..." : "");
    }

    showSpeechBubble(text) {
      this.speechBubble = {
        text: text,
        startTime: Date.now(),
        duration: 3000
      };
      this.speechTimer = this.speechBubble.duration;
    }

    updateSpeech() {
      if (this.speechBubble) {
        this.speechTimer -= 16;
        if (this.speechTimer <= 0) {
          this.speechBubble = null;
        }
      }

      const currentTime = Date.now();
      if (currentTime - this.lastSpeechTime > this.nextSpeechDelay) {
        if (!this.speechBubble && Math.random() < 0.3) {
          const snippet = this.getRandomTextSnippet();
          this.showSpeechBubble(snippet);
          this.lastSpeechTime = currentTime;
          this.nextSpeechDelay = this.getRandomSpeechDelay();
        }
      }
    }

    async visitLink(url) {
      if (this.isVisiting) return;
      
      this.isVisiting = true;
      this.showSpeechBubble("Going to visit: " + url.split('/').pop());
      
      try {
        // Check if it's a local file URL
        if (url.startsWith('file://')) {
          this.showSpeechBubble("Can't visit local files - security blocked");
          this.notify(`Cannot visit local file: ${url} (browser security restriction)`);
          this.isVisiting = false;
          return;
        }
        
        // Check if it's a relative URL or same-origin
        let targetUrl = url;
        if (url.startsWith('./') || url.startsWith('../') || (!url.includes('://'))) {
          // For relative URLs, convert to absolute
          targetUrl = new URL(url, window.location.href).href;
        }
        
        // Check if it's same origin or localhost/development server
        const currentOrigin = window.location.origin;
        const targetUrlObj = new URL(targetUrl);
        const isLocalhost = targetUrlObj.hostname === 'localhost' || 
                           targetUrlObj.hostname === '127.0.0.1' || 
                           targetUrlObj.hostname === '0.0.0.0';
        const isSameOrigin = targetUrlObj.origin === currentOrigin;
        
        if (isSameOrigin || isLocalhost) {
          // For same-origin or localhost URLs, use iframe
          this.visitWithIframe(targetUrl);
        } else {
          // For external URLs, simulate visit
          this.simulateExternalVisit(targetUrl);
        }
        
      } catch (error) {
        this.showSpeechBubble("Couldn't visit that link...");
        this.notify(`Failed to visit ${url}: ${error.message}`);
        this.isVisiting = false;
      }
    }

    simulateExternalVisit(url) {
      // Simulate visiting external URL without actually loading it
      setTimeout(() => {
        markVisitedLink(url);
        setStickmanPage(this.id, url);
        
        this.showSpeechBubble("Simulated visit to: " + url.split('/').pop());
        this.notify(`Simulated visit to external site: ${url}`);
        this.isVisiting = false;
      }, 1500 + Math.random() * 2000);
    }

    visitWithIframe(url) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.style.position = 'absolute';
      iframe.style.top = '-9999px';
      
      // Add error handling for iframe
      iframe.onerror = () => {
        this.showSpeechBubble("Couldn't load that page");
        this.notify(`Failed to load in iframe: ${url}`);
        this.isVisiting = false;
        try { iframe.remove(); } catch (e) {}
      };
      
      iframe.onload = () => {
        setTimeout(() => {
          markVisitedLink(url);
          setStickmanPage(this.id, url);
          
          this.showSpeechBubble("Visited: " + url.split('/').pop());
          this.notify(`Successfully visited ${url}`);
          this.isVisiting = false;
          try { iframe.remove(); } catch (e) {}
        }, 1000 + Math.random() * 2000);
      };
      
      iframe.src = url;
      document.body.appendChild(iframe);
      
      // Fallback timeout in case load events don't fire
      setTimeout(() => {
        if (this.isVisiting) {
          this.showSpeechBubble("Visit timed out");
          this.notify(`Visit timed out for: ${url}`);
          this.isVisiting = false;
          try { iframe.remove(); } catch (e) {}
        }
      }, 10000); // 10 second timeout
    }

    getTextSurfaces() {
      const surfaces = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.textContent.trim()) continue;
        if (!node.parentElement.offsetParent) continue;
        const range = document.createRange();
        range.selectNodeContents(node);
        const rects = range.getClientRects();
        for (let r of rects) {
          surfaces.push({
            x: r.left + window.scrollX,
            y: r.top + window.scrollY,
            width: r.width,
            height: r.height
          });
        }
      }
      
      try {
        const anchors = document.querySelectorAll('a');
        anchors.forEach(a => {
          if (!a.offsetParent) return;
          const r = a.getBoundingClientRect();
          if (r.width && r.height) {
            surfaces.push({
              x: r.left + window.scrollX,
              y: r.top + window.scrollY,
              width: r.width,
              height: r.height
            });
          }
        });
      } catch (e) {}
      return surfaces;
    }

    summarizePage() {
      const textNodes = this.getPageText();
      const allText = textNodes.join(" ");
      const words = allText.split(/\s+/).slice(0, 50);
      return words.join(" ") + (words.length < allText.split(/\s+/).length ? "..." : "");
    }

    notify(message) {
      console.log(`Stickman ${this.id}: ${message}`);
    }

    update(cursor) {
      if (!this.visible || !isStickmanOnCurrentPage(this.id)) return;

      const surfaces = this.getTextSurfaces();
      this.updateSpeech();

      if (this.y > window.innerHeight + respawnOffset) {
        if (surfaces.length > 0) {
          this.x = surfaces[0].x + 10;
          this.y = surfaces[0].y - this.size * 2.5;
          this.dy = 0;
          this.onGround = true;
        } else {
          this.x = 50; this.y = 0; this.dy = 0; this.onGround = false;
        }
      }

      if (this.directionChangeDelay > 0) this.directionChangeDelay--;

      const distToCursor = Math.hypot(this.x - cursor.x, this.y - cursor.y);
      if (distToCursor < cursorHangDist) this.hanging = true;
      else if (this.hanging && distToCursor > cursorHangDist*2) this.hanging = false;

      this.idleTimer++;
      if (this.idleTimer > idleInterval) {
        const rand = Math.random();
        if (rand < 0.2) this.idleState = "sitting";
        else if (rand < 0.4) this.idleState = "standing";
        else this.idleState = "walking";
        this.idleTimer = 0;
      }

      if (this.hanging) {
        const followSpeed = 0.08;
        this.x += (cursor.x - this.x) * followSpeed;
        this.y += (cursor.y - this.y) * followSpeed;
        this.dy = 0;
        this.onGround = true;
        this.idleState = "walking";
      } else {
        this.dy += gravity;
        this.y += this.dy;
        this.onGround = false;

        let currentSurface = null;
        for (let s of surfaces) {
          const feet = this.y + this.size * 2.5;
          if (
            this.x >= s.x - 2 && this.x <= s.x + s.width + 2 &&
            feet >= s.y && feet <= s.y + s.height &&
            this.dy >= 0
          ) {
            this.y = s.y - this.size * 2.5;
            this.dy = 0;
            this.onGround = true;
            this.dx = moveSpeed;
            currentSurface = s;
            this.lastSurface = s;
          }
        }

        if (this.onGround && currentSurface) {
          const elem = document.elementFromPoint(this.x - window.scrollX, currentSurface.y - window.scrollY + 1);
          if (elem && elem.tagName.toLowerCase() === 'a') {
            this.onLink = true;
            this.currentLink = elem.href;
          } else {
            this.onLink = false;
            this.currentLink = null;
          }
        } else {
          this.onLink = false;
          this.currentLink = null;
        }

        if (this.onLink && this.currentLink && !this.isVisiting) {
          try {
            const alreadyVisited = (storage.visitedLinks || []).includes(this.currentLink);
            const hasPendingVisit = this.taskQueue.some(t => t.type === 'visitLink');
            const visitChance = 0.001;
            if (!alreadyVisited && !hasPendingVisit && Math.random() < visitChance) {
              this.taskQueue.push({type: 'visitLink', auto: true, url: this.currentLink});
            }
          } catch (e) {}
        }

        if (this.onGround && currentSurface && this.idleState === "walking") {
          const edgeMargin = 15;
          const nextX = this.x + this.dx * this.direction;
          
          if ((nextX < currentSurface.x + edgeMargin || nextX > currentSurface.x + currentSurface.width - edgeMargin)) {
            if (this.directionChangeDelay === 0) {
              if (Math.random() < 0.8) {
                this.direction *= -1;
                this.directionChangeDelay = 60;
              } else {
                this.idleState = "sitting";
              }
            }
          } else {
            this.x = nextX;
          }

          const lowerPlatforms = surfaces.filter(s =>
            s.y > currentSurface.y + 10 &&
            Math.abs((s.x + s.width/2) - this.x) < 60
          );
          if (lowerPlatforms.length > 0 && Math.random() < 0.01) {
            const nextPlatform = lowerPlatforms.sort((a,b)=>a.y - b.y)[0];
            const targetX = nextPlatform.x + nextPlatform.width / 2;
            this.direction = (targetX >= this.x) ? 1 : -1;
            this.dx = moveSpeed * 1.2;
            this.dy = dropPower;
            this.onGround = false;
          }

          const higherPlatforms = surfaces.filter(s =>
            s.y < currentSurface.y - 5 &&
            Math.abs((s.x + s.width/2) - this.x) < 40 &&
            currentSurface.y - s.y < 40
          );
          if (higherPlatforms.length > 0 && Math.random() < 0.005) {
            this.dy = jumpPower;
            this.onGround = false;
          }
        }
      }

      if (this.x > window.innerWidth + 10) this.x = -10;
      if (this.x < -10) this.x = window.innerWidth + 10;

      if (this.dx !== 0 && this.onGround && this.idleState === "walking") {
        this.walkingFrame += 0.15;
      }

      if (this.taskQueue.length > 0) {
        const task = this.taskQueue[0];
        if (task.type === "read") {
          const summary = this.summarizePage();
          this.notify(`Finished reading: ${summary}`);
          this.showSpeechBubble("Just read this page!");
          this.taskQueue.shift();
        } else if (task.type === "visitLink") {
          if (this.onLink && this.currentLink && !this.isVisiting) {
            this.visitLink(this.currentLink);
            this.taskQueue.shift();
          } else if (!this.onLink) {
            this.showSpeechBubble("Looking for a link to visit...");
            const links = document.querySelectorAll('a[href]');
            if (links.length > 0) {
              const randomLink = links[Math.floor(Math.random() * links.length)];
              this.visitLink(randomLink.href);
              this.taskQueue.shift();
            } else {
              this.showSpeechBubble("No links found on this page.");
              this.taskQueue.shift();
            }
          }
        } else if (task.type === "speak") {
          const text = task.text || this.getRandomTextSnippet();
          this.showSpeechBubble(text);
          this.taskQueue.shift();
        }
      }

      if (Math.random() < 0.01) {
        this.savePosition();
      }
    }

    draw(ctx) {
      if (!this.visible || !isStickmanOnCurrentPage(this.id)) return;
      
      ctx.save();
      ctx.translate(0, -window.scrollY);
      const s = this.size;
      ctx.strokeStyle = stickmanColor;
      ctx.lineWidth = 2;

      const drawX = Math.round(this.x);
      const drawY = Math.round(this.y);

      ctx.beginPath();
      ctx.arc(drawX, drawY - s * 1.5, s * 0.7, 0, Math.PI*2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(drawX, drawY - s*0.8);
      ctx.lineTo(drawX, drawY);
      ctx.stroke();

      let swing = 0;
      if (this.idleState === "walking") swing = Math.sin(this.walkingFrame) * s*0.5;
      else if (this.idleState === "sitting") swing = Math.sin(this.walkingFrame*0.3)*s*0.15;
      else if (this.idleState === "standing") swing = Math.sin(this.walkingFrame*0.1)*s*0.08;

      ctx.beginPath();
      ctx.moveTo(drawX, drawY - s*0.8);
      ctx.lineTo(Math.round(drawX - s + swing), drawY - s*0.2);
      ctx.moveTo(drawX, drawY - s*0.8);
      ctx.lineTo(Math.round(drawX + s - swing), drawY - s*0.2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(drawX, drawY);
      ctx.lineTo(Math.round(drawX - s + swing), drawY + s);
      ctx.moveTo(drawX, drawY);
      ctx.lineTo(Math.round(drawX + s - swing), drawY + s);
      ctx.stroke();

      if (this.speechBubble) {
        this.drawSpeechBubble(ctx, drawX, drawY);
      }

      ctx.restore();
    }

    drawSpeechBubble(ctx, x, y) {
      const bubble = this.speechBubble;
      if (!bubble) return;

      const text = bubble.text;
      const bubbleY = y - this.size * 4;
      const maxWidth = 150;
      const padding = 8;
      
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const testWidth = ctx.measureText(testLine).width;
        
        if (testWidth > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
      
      const lineHeight = 16;
      const bubbleWidth = Math.min(maxWidth + padding * 2, Math.max(...lines.map(line => ctx.measureText(line).width)) + padding * 2);
      const bubbleHeight = lines.length * lineHeight + padding * 2;
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
      ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
      ctx.lineWidth = 1;
      
      const bubbleX = x - bubbleWidth / 2;
      const bubbleTop = bubbleY - bubbleHeight;
      
      this.drawRoundedRect(ctx, bubbleX, bubbleTop, bubbleWidth, bubbleHeight, 8);
      ctx.fill();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(x - 8, bubbleTop + bubbleHeight);
      ctx.lineTo(x, bubbleTop + bubbleHeight + 8);
      ctx.lineTo(x + 8, bubbleTop + bubbleHeight);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.textAlign = "center";
      
      for (let i = 0; i < lines.length; i++) {
        const textY = bubbleTop + padding + (i + 1) * lineHeight - 4;
        ctx.fillText(lines[i], x, textY);
      }
    }

    drawRoundedRect(ctx, x, y, width, height, radius) {
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
    }
  }

  // ==== MULTIPLE STICKMEN ====
  const stickmen = [];
  const slots = getSlots();
  for (let i=0; i<slots.length; i++) {
    const sm = new Stickman(slots[i]);
    sm.loadPosition();
    sm.visible = false;
    stickmen.push(sm);
  }

  if (stickmen.length === 0) {
    const sm = new Stickman("sm_1");
    setStickmanPage("sm_1", window.location.href);
    stickmen.push(sm);
  }

  function animate() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    for (let sm of stickmen) {
      sm.update(cursor);
      sm.draw(ctx);
    }
    requestAnimationFrame(animate);
  }
  animate();

  // ==== API ====
  window.StickmanAI = {
    bringOut: function(id) {
      const sm = stickmen.find(s => s.id===id);
      if (sm) { 
        sm.visible = true; 
        removeFromSlot(id); 
        setStickmanPage(id, window.location.href);
      }
    },
    store: function(id) {
      const sm = stickmen.find(s => s.id===id);
      if (sm) { 
        sm.visible = false; 
        addToSlot(id); 
        sm.savePosition(); 
      }
    },
    createNew: function(id) {
      const sm = new Stickman(id);
      setStickmanPage(id, window.location.href);
      stickmen.push(sm);
      addToSlot(id);
    },
    listSlots: function() {
      return getSlots();
    },
    assignTask: function(id, task) {
      const sm = stickmen.find(s => s.id===id);
      if (sm && isStickmanOnCurrentPage(id)) {
        sm.taskQueue.push(task);
      }
    },
    makeSpeak: function(id, text) {
      const sm = stickmen.find(s => s.id===id);
      if (sm && isStickmanOnCurrentPage(id)) {
        if (text) {
          sm.showSpeechBubble(text);
        } else {
          sm.taskQueue.push({type: 'speak'});
        }
      }
    },
    visitLink: function(id, url) {
      const sm = stickmen.find(s => s.id===id);
      if (sm && isStickmanOnCurrentPage(id)) {
        if (url) {
          sm.visitLink(url);
        } else {
          sm.taskQueue.push({type: 'visitLink'});
        }
      }
    },
    moveToCurrentPage: function(id) {
      setStickmanPage(id, window.location.href);
      const sm = stickmen.find(s => s.id === id);
      if (sm) sm.visible = true;
    },
    getStickmanInfo: function() {
      return stickmen.map(sm => ({
        id: sm.id,
        visible: sm.visible,
        onCurrentPage: isStickmanOnCurrentPage(sm.id),
        assignedPage: getStickmanPage(sm.id),
        speaking: !!sm.speechBubble,
        speechText: sm.speechBubble ? sm.speechBubble.text : null,
        onLink: sm.onLink,
        currentLink: sm.currentLink,
        isVisiting: sm.isVisiting
      }));
    }
  }

});