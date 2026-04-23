
import { useCallback, useRef, useState } from "react";
import type { ReplayAgent } from "../types";



const AGENT_COLORS = ["#a78bfa", "#34d399", "#fb923c", "#60a5fa", "#f472b6"];
const ROW_DELTAS = [-1, 0, 1, 0]; // index maps to action: 0=up 1=right 2=down 3=left
const COL_DELTAS = [0, 1, 0, -1];


type ReplaySnapshot = {
  episode: number;
  policy: number[][][]; // [row][col][action] -> probability
  policy_changed_pct: number; // 0 means policy converged, skip this one
};


// Takes an agent and returns a NEW agent with updated position
function stepAgent(agent: ReplayAgent, goalPos: [number, number]): ReplayAgent {
  const [r, c] = agent.pos;

  // grab this cell's action probabilities from the policy
  const actions = agent.policy[r]?.[c]; // returns undefined instead of crashing if r is out of bounds

  // if no actions exist for this cell, mark done
  if (!actions) return { ...agent, done: true };
  

  // find the index of the highest value -- equivalent to argmax in numpy
  const bestAction = actions.indexOf(Math.max(...actions));

  const newR = r + ROW_DELTAS[bestAction];
  const newC = c + COL_DELTAS[bestAction];

  const gridSize = agent.policy.length;

  // bounds check 
  if (newR < 0 || newR >= gridSize || newC < 0 || newC >= gridSize) {
    return { ...agent, done: true };
  }

  // cycle detection 
  // key is "row,col" 
  const key = `${newR},${newC}`; 
  if (agent.visited.has(key)) return { ...agent, done: true };

  //gotta copy cus can't mutate state in react 
  const newVisited = new Set(agent.visited);
  newVisited.add(key);

  const stepLimit = gridSize * gridSize * 3;
  const reachedGoal = newR === goalPos[0] && newC === goalPos[1];
  const hitLimit = agent.steps + 1 >= stepLimit;

  // return a new agent struct with updated fields
  return {
    ...agent, // copy all existing fields
    pos: [newR, newC] as [number, number], // override pos
    steps: agent.steps + 1, // override steps
    done: reachedGoal || hitLimit, // override done
    visited: newVisited, // override visited
  };
}

// ---- THE HOOK ----
// A hook is just a regular function that uses React's useState/useRef/etc

// Every time the component that calls this hook re-renders, this function runs again top to bottom
// HOWEVER: useState and useRef preserve their values across those re-runs (that's the whole point)
export function useSequentialReplay(
  startPos: [number, number],
  goalPos: [number, number],
  displaySpeed: number,
  snapshots: Record<
    string,
    { policy: number[][][]; policy_changed_pct: number }
  >,
) {
  // intervalRef holds the ID returned by setInterval so we can clearInterval later
  const intervalRef = useRef<number | null>(null);

  // queueRef holds our ordered array of snapshots to play through
  // using a ref instead of state because mutating the queue (.shift()) should NOT trigger a redraw
  const queueRef = useRef<ReplaySnapshot[]>([]);

  // activeAgent IS state because when it changes, the grid needs to redraw to show the new position
  // null means no agent is currently active
  const [activeAgent, setActiveAgent] = useState<ReplayAgent | null>(null);

  // status is state because the UI reacts to it (show play button, show done message, etc.)
  const [status, setStatus] = useState<"idle" | "playing" | "done">("idle");


  // Pops the next snapshot off the queue and creates a fresh agent at startPos
  // If queue is empty, ends the replay
  // This is a plain function (not useCallback) because it's only ever called
  // INSIDE the interval callback, never passed as a prop or dependency
  function spawnNext() {
    
    if (queueRef.current.length === 0) {
      clearInterval(intervalRef.current!);
      setStatus("done");
      setActiveAgent(null);
      return;
    }

    const next = queueRef.current.shift()!;

    // schedule a redraw for the next agent 
    setActiveAgent({
      id: next.episode,
      pos: [...startPos] as [number, number], 
      color: AGENT_COLORS[next.episode % AGENT_COLORS.length],
      policy: next.policy,
      steps: 0,
      done: false,
      visited: new Set([`${startPos[0]},${startPos[1]}`]), 
    });
  }

  const drainReplays = useCallback(() => {
    intervalRef.current = setInterval(() => {
      // functional update form -- REQUIRED inside setInterval
      // the interval closure is stale after creation, so `prev` is how you get the latest value
      setActiveAgent((prev) => {
        // no agent yet -- spawn the first one
        // returning null here means "don't change state" -- React skips the redraw
        if (!prev) {
          spawnNext();
          return null;
        }

        // current agent finished -- spawn the next one
        if (prev.done) {
          spawnNext();
          return null;
        }

        // agent still walking -- step it forward and return the new state
        // stepAgent is pure (no side effects) -- takes old struct, returns new struct
        return stepAgent(prev, goalPos);
      });
    }, displaySpeed);
    
  }, [displaySpeed, goalPos]);


  // call from app once when training status is complete 
  function startReplay() {
    // Object.entries converts { "0": val, "50": val } to [ ["0", val], ["50", val] ]
    // equivalent to iterating over a hash map's key-value pairs
    const ordered = Object.entries(snapshots)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      // sort by episode number ascending
      // the ([a], [b]) destructures the ["key", value] tuples to just grab the key
      .filter(([, snap]) => snap.policy_changed_pct !== 0)
      // skip snapshots where policy didn't change -- no new behavior to show
      // the leading comma [, snap] ignores the first element (the key) and binds the second
      .map(([ep, snap]) => ({
        // convert each entry into a ReplaySnapshot struct
        episode: parseInt(ep),
        policy: snap.policy,
        policy_changed_pct: snap.policy_changed_pct,
      }));

    // store in the ref so the interval can access it without triggering redraws on mutation
    queueRef.current = ordered;
    setStatus("playing"); // triggers redraw -- UI can now show "playing" state
    drainReplays(); // start the interval
  }

  
  // call when user switches back to editing 
  function reset() {
    clearInterval(intervalRef.current!); // stop the interval
    setActiveAgent(null); // clear the agent from the grid
    queueRef.current = []; // empty the queue
    setStatus("idle");
  }

  
  return { activeAgent, status, startReplay, reset };
}
