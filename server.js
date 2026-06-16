// Custom Next.js server with an attached Socket.IO instance. A long-lived Node
// process is required for realtime chat (plain Edge runtimes won't work).
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const port = parseInt(process.env.PORT || '3000', 10);
const hostname = '0.0.0.0';

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

function parseCookies(header) {
  const out = {};
  (header || '').split(';').forEach((pair) => {
    const idx = pair.indexOf('=');
    if (idx === -1) return;
    const k = pair.slice(0, idx).trim();
    const v = pair.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  });
  return out;
}

app.prepare().then(async () => {
  // jose is ESM-only; load it dynamically from this CommonJS file.
  const { jwtVerify } = await import('jose');
  const { Server } = require('socket.io');

  const secret = new TextEncoder().encode(process.env.JWT_SECRET);

  const server = createServer((req, res) => {
    handle(req, res, parse(req.url, true));
  });

  const io = new Server(server, {
    path: '/socket.io',
    cors: { origin: process.env.NEXT_PUBLIC_APP_URL, credentials: true },
  });

  // Expose to API route handlers (see lib/realtime.js).
  globalThis.__cs_io = io;

  // Authenticate every socket from the JWT cookie; scope it to a couple room.
  io.use(async (socket, nextFn) => {
    try {
      const cookies = parseCookies(socket.handshake.headers.cookie);
      const token = cookies['cs_token'];
      if (!token) return nextFn(new Error('unauthorized'));
      const { payload } = await jwtVerify(token, secret, {
        issuer: 'couplespace',
        audience: 'couplespace-app',
      });
      socket.data.userId = payload.sub;
      socket.data.coupleId = payload.coupleId || null;
      nextFn();
    } catch {
      nextFn(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    const { coupleId, userId } = socket.data;
    if (!coupleId) return;
    const room = `couple:${coupleId}`;
    socket.join(room);
    socket.to(room).emit('presence', { userId, online: true });

    socket.on('typing', (isTyping) => {
      socket.to(room).emit('typing', { userId, isTyping: !!isTyping });
    });

    socket.on('presence:ping', () => {
      socket.to(room).emit('presence', { userId, online: true });
    });

    socket.on('disconnect', () => {
      socket.to(room).emit('presence', { userId, online: false });
    });
  });

  server.listen(port, () => {
    console.log(`> CoupleSpace ready on http://localhost:${port} (${dev ? 'dev' : 'prod'})`);
  });
});
