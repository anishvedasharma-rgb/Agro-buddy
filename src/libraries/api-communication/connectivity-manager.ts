/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Connectivity Manager & Network State Hook
 */

import { useState, useEffect } from 'react';
import { SyncQueueManager } from './sync-queue.ts';
import { SyncTelemetry } from './types.ts';

export function useConnectivity(): SyncTelemetry {
  const [telemetry, setTelemetry] = useState<SyncTelemetry>(SyncQueueManager.getTelemetry());

  useEffect(() => {
    const handleOnline = () => setTelemetry(SyncQueueManager.getTelemetry());
    const handleOffline = () => setTelemetry(SyncQueueManager.getTelemetry());

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const unsubscribe = SyncQueueManager.subscribe((newTelem) => {
      setTelemetry(newTelem);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
    };
  }, []);

  return telemetry;
}
