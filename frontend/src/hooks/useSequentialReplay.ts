import { useCallback, useRef, useState } from "react";
import type { GridData, ReplayAgent } from "../types";

const AGENT_COLORS = ["#a78bfa", "#34d399", "#fb923c", "#60a5fa", "#f472b6"];
const ROW_DELTAS = [-1, 0, 1, 0]; // 0=up 1=right 2=down 3=left
const COL_DELTAS = [0, 1, 0, -1];

type ReplaySnapshot = {
  episode: number;
  policy: number[][][];
  policy_changed_pct: number;
};

function stepAgent(agent: ReplayAgent, goalPos: [number, number], grid:GridData): ReplayAgent {
  const [r, c] = agent.pos;
  const actions = agent.policy[r]?.[c];

  if (!actions) return { ...agent, done: true };

  // FIX 1: Random tie-breaking for untrained policies
  const maxVal = Math.max(...actions);
  const bestIndices = actions
    .map((val, idx) => (val === maxVal ? idx : -1))
    .filter((idx) => idx !== -1);
  const bestAction =
    bestIndices[Math.floor(Math.random() * bestIndices.length)];

  let newR = r + ROW_DELTAS[bestAction];
  let newC = c + COL_DELTAS[bestAction];
  const gridSize = agent.policy.length;

  // if the agent runs into a wall, it should keep them in the same pos 
  if ((newR < 0 || newR >= gridSize || newC < 0 || newC >= gridSize) || grid[newR][newC].type == 'wall') {
    newR = r;
    newC = c;
  }

  const key = `${newR},${newC}`;
  if (agent.visited.has(key)) return { ...agent, done: true };

  const newVisited = new Set(agent.visited);
  newVisited.add(key);

  const stepLimit = gridSize * gridSize * 3;
  const reachedGoal = newR === goalPos[0] && newC === goalPos[1];
  const hitLimit = agent.steps + 1 >= stepLimit;

  return {
    ...agent,
    pos: [newR, newC] as [number, number],
    steps: agent.steps + 1,
    done: reachedGoal || hitLimit,
    visited: newVisited,
  };
}

export function useSequentialReplay(
  startPos: [number, number],
  goalPos: [number, number],
  displaySpeed: number,
  snapshots: Record<
    string,
    { policy: number[][][]; policy_changed_pct: number }
  >,
  grid:GridData
) {
  const intervalRef = useRef<number | null>(null);
  const queueRef = useRef<ReplaySnapshot[]>([]);
  const agentRef = useRef<ReplayAgent | null>(null);
  const [activeAgent, setActiveAgent] = useState<ReplayAgent | null>(null);
  const [status, setStatus] = useState<"idle" | "playing" | "done">("idle");

  const setAgentSync = (newAgent: ReplayAgent | null) => {
    agentRef.current = newAgent;
    setActiveAgent(newAgent);
  };

  const spawnNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      clearInterval(intervalRef.current!);
      setStatus("done");
      setAgentSync(null);
      return;
    }

    const next = queueRef.current.shift()!;

    setAgentSync({
      id: next.episode,
      pos: [...startPos] as [number, number],
      color: AGENT_COLORS[next.episode % AGENT_COLORS.length],
      policy: next.policy,
      steps: 0,
      done: false,
      visited: new Set([`${startPos[0]},${startPos[1]}`]),
    });
  }, [startPos]);

  function startReplay() {
    const ordered = Object.entries(snapshots)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      // REMOVED: The strict policy_changed_pct filter
      .map(([ep, snap]) => ({
        episode: parseInt(ep),
        policy: snap.policy,
        policy_changed_pct: snap.policy_changed_pct,
      }));

    queueRef.current = ordered;
    setStatus("playing");
    drainReplays();
  }

  const drainReplays = useCallback(() => {
    intervalRef.current = setInterval(() => {
      const currentAgent = agentRef.current;

      if (!currentAgent) {
        spawnNext();
      } else if (currentAgent.done) {
        // Clear the agent and wait one tick before spawning the next
        // This creates a visual "blink" that makes the transition clear
        setAgentSync(null);
      } else {
        setAgentSync(stepAgent(currentAgent, goalPos, grid));
      }
    }, displaySpeed);
  }, [displaySpeed, goalPos, spawnNext, grid]);

  function reset() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setAgentSync(null);
    queueRef.current = [];
    setStatus("idle");
  }

  return { activeAgent, status, startReplay, reset };
}
