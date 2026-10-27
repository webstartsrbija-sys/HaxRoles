// HaxRoles server: servira igru (public/index.html) i prosleđuje poruke između domaćina sobe i igrača.
// Meč se i dalje računa u browseru domaćina; server samo prenosi poruke, pa radi na svakoj mreži.
const http = require('http');
const fs = require('fs');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'public', 'index.html');

const server = http.createServer((req, res) => {
  const url = req.url.split('?')[0];
  if (url === '/' || url === '/index.html') {
    fs.readFile(INDEX, (err, data) => {
      if (err) { res.writeHead(500); res.end('Nema public/index.html'); return; }
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  } else if (url === '/health') {
    res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end('ok');
  } else {
    res.writeHead(404); res.end('Nije pronađeno');
  }
});

const wss = new WebSocketServer({ server, path: '/ws', maxPayload: 256 * 1024 });
const clients = new Map(); // id -> socket

function send(ws, m) { if (ws.readyState === 1) ws.send(JSON.stringify(m)); }

wss.on('connection', ws => {
  ws.peers = new Set();
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  ws.on('message', buf => {
    let m; try { m = JSON.parse(buf); } catch { return; }
    if (m.k === 'reg') { // prijava sa ID-jem (domaćin: hxr-KOD, igrač: nasumičan)
      if (ws.id || typeof m.id !== 'string' || m.id.length > 40) return;
      if (clients.has(m.id)) { send(ws, { k: 'err', type: 'unavailable-id' }); return; }
      ws.id = m.id; clients.set(m.id, ws); send(ws, { k: 'ok' });
      return;
    }
    if (!ws.id || typeof m.to !== 'string') return;
    const to = clients.get(m.to);
    if (m.k === 'connect') {
      if (!to) { send(ws, { k: 'err', type: 'peer-unavailable' }); return; }
      ws.peers.add(m.to); to.peers.add(ws.id);
    }
    if (!to || !ws.peers.has(m.to)) return; // šalje se samo onome sa kim postoji veza
    if (!['connect', 'accept', 'data', 'close'].includes(m.k)) return;
    send(to, { k: m.k, from: ws.id, d: m.d });
    if (m.k === 'close') { ws.peers.delete(m.to); to.peers.delete(ws.id); }
  });

  ws.on('close', () => {
    if (ws.id && clients.get(ws.id) === ws) clients.delete(ws.id);
    for (const pid of ws.peers) {
      const o = clients.get(pid);
      if (o) { o.peers.delete(ws.id); send(o, { k: 'close', from: ws.id }); }
    }
  });
});

// izbaci mrtve veze
setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.isAlive) { ws.terminate(); continue; }
    ws.isAlive = false; ws.ping();
  }
}, 30000);

server.listen(PORT, () => console.log('HaxRoles server radi na portu ' + PORT));
