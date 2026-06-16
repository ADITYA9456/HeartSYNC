// Bridge from API routes to the Socket.IO server. The custom server (server.js)
// stashes the `io` instance on globalThis so route handlers in the same Node
// process can emit realtime events to a couple's room.
import 'server-only';

export function coupleRoom(coupleId) {
  return `couple:${coupleId}`;
}

export function emitToCouple(coupleId, event, payload) {
  const io = globalThis.__cs_io;
  if (!io) return false;
  io.to(coupleRoom(coupleId)).emit(event, payload);
  return true;
}
