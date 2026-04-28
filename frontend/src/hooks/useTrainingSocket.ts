// hooks/useTrainingSocket.ts
import { useState, useRef, useCallback } from "react";
import type { TrainingUpdate } from "../types";

export function useTrainingSocket(displaySpeed: number) {
  // what the UI reads to render grids and charts
  const [currentUpdate, setCurrentUpdate] = useState<TrainingUpdate | null>(
    null,
  ); // for heat maps
  const [episodeHistory, setEpisodeHistory] = useState<TrainingUpdate[]>([]); // for graphs
  const [snapshots, setSnapshots] = useState<
    Record<string, { q_table: number[][][]; policy_changed_pct: number }>
  >({}); // for replay
  const [trainingStatus, setTrainingStatus] = useState<
    "idle" | "connecting" | "training" | "complete"
  >("idle");

  // refs hold things that shouldnt cause re-renders when they change
  const queueRef = useRef<TrainingUpdate[]>([]); // buffer of incoming messages
  const drainRef = useRef<number | null>(null); // the interval timer id
  const serverDoneRef = useRef(false); // track when the server stops sending messages
  const firstMessageRef = useRef(false);

  // this function is recreated everytime display speed changes (useCallback)
  const drainQueue = useCallback(() => {
    // every displaySpeed in ms, perform the inner func
    drainRef.current = setInterval(() => {
      if (queueRef.current.length === 0) {
        // only stop and mark complete if server is also done sending
        if (serverDoneRef.current) {
          clearInterval(drainRef.current!);
          setTrainingStatus("complete");
        }
        return; // dont read from empty
      }

      const next = queueRef.current.shift()!; // get next episode checkpoint

      // update the current data so it reflects on the maps and graphs
      setCurrentUpdate(next);
      setEpisodeHistory((prev) => [...prev, next]);
    }, displaySpeed);
  }, [displaySpeed]);

  const connect = useCallback(
    (config: object) => {
      // wipe previous run
      queueRef.current = [];
      serverDoneRef.current = false;
      firstMessageRef.current = false; 
      setEpisodeHistory([]);
      setCurrentUpdate(null);
      setSnapshots({});
      setTrainingStatus("connecting");

      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
      const wsUrl = apiUrl.replace(/^http/, "ws");
      const ws = new WebSocket(`${wsUrl}/ws/train`);

      ws.onopen = () => {
        ws.send(JSON.stringify(config));
        drainQueue(); // start the interval that drains the queue
      };

      // whenever message is received, add to queue that's already draining on an interval
      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "update") {
          if (!firstMessageRef.current) {
            firstMessageRef.current = true;
            setTrainingStatus("training"); // <-- first message arrived
          }
          queueRef.current.push(data); // dump into buffer, interval will show it
        }
        if (data.type === "complete") {
          setSnapshots(data.snapshots);
          // the queue might still have episodes in it, so setting the trainingStatus to complete happens in the drainQueue function
          serverDoneRef.current = true;
        }
      };

      ws.onclose = () => {};
    },
    [drainQueue],
  );

  const reset = useCallback(() => {
    queueRef.current = [];
    serverDoneRef.current = false;
    setEpisodeHistory([]);
    setCurrentUpdate(null);
    setSnapshots({});
    setTrainingStatus("idle");
    if (drainRef.current) clearInterval(drainRef.current);
  }, []);

  return {
    trainingStatus,
    currentUpdate,
    episodeHistory,
    snapshots,
    connect,
    reset,
  };
}
