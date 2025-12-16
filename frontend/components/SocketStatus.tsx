"use client";

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';

export default function SocketStatus() {
  const [connected, setConnected] = useState(false);
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    const socket = getSocket();
    const onConnect = () => {
      setConnected(true);
      console.log('[socket] connected', socket.id);
    };
    const onDisconnect = (reason: string) => {
      setConnected(false);
      console.warn('[socket] disconnected:', reason);
    };
    const onConnectError = (err: any) => {
      setAttempts((a) => a + 1);
      console.error('[socket] connect_error', err);
    };
    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
    };
  }, []);

  return (
    <div className="fixed bottom-3 right-3 z-40 text-xs px-2 py-1 rounded-lg"
      style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
    >
      Socket: {connected ? 'Connected' : `Disconnected${attempts ? ` (retries: ${attempts})` : ''}`}
    </div>
  );
}
