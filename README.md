# Grid World RL

An interactive reinforcement learning visualizer built to make the fundamentals of RL tangible. Train an agent on a customizable grid environment using three classic algorithms and watch the policy and value function evolve in real time.

**[Live Demo](https://your-deployed-site.vercel.app)** <!-- replace with your URL -->

![Training Demo](./assets/demo.gif) <!-- replace with actual screenshot/gif -->

---

## Overview

Most introductions to reinforcement learning are either purely theoretical or hidden behind high-level library abstractions. This project sits in the middle: every algorithm is implemented from scratch in NumPy, and a WebSocket-driven frontend renders the learning process as it happens — policy arrows updating, value heatmaps shifting, and a replay agent tracing the greedy path learned across training snapshots.

The goal was twofold: to build a solid intuition for how these algorithms actually work, and to create something that others can experiment with without needing to write a single line of code.

---

## Algorithms

All three algorithms are implemented from scratch following Sutton & Barto's *Reinforcement Learning: An Introduction* (2nd ed.).

**Monte Carlo Control** (Chapter 5.3 — On-policy First Visit)

The agent runs complete episodes, then updates Q-values by averaging the discounted returns $G_t$ that followed each state-action pair. Because updates only happen after an episode ends, Monte Carlo has high variance but no bootstrapping bias.

$$G_t = R_{t+1} + \gamma R_{t+2} + \gamma^2 R_{t+3} + \cdots$$

$$Q(s,a) \leftarrow Q(s,a) + \frac{1}{n}(G - Q(s,a))$$

**Q-Learning** (Chapter 6.5 — Off-policy TD Control)

A one-step TD method. After each transition the agent updates the Q-value of the current state-action pair using the maximum Q-value of the next state, regardless of what action is actually taken next. This off-policy nature means Q-Learning directly approximates the optimal policy.

$$Q(s,a) \leftarrow Q(s,a) + \alpha \left[ R + \gamma \max_{a'} Q(s', a') - Q(s,a) \right]$$

**SARSA** (Chapter 6.4 — On-policy TD Control)

Like Q-Learning but uses the action actually selected under the current policy for its update target rather than the greedy maximum. This makes SARSA more conservative in environments with risky paths near walls or cliffs.

$$Q(s,a) \leftarrow Q(s,a) + \alpha \left[ R + \gamma Q(s', a') - Q(s,a) \right]$$

---

## Environment

The environment is a configurable $N \times N$ grid world where:

- The agent starts at a user-defined start cell and navigates toward a goal cell
- Stepping into a wall or out of bounds leaves the agent in place
- Every non-terminal step yields a reward of $-1$; reaching the goal yields $0$
- The agent's state is its $(row, col)$ position; actions are $\{up, right, down, left\}$

This reward structure encourages the agent to find the shortest path to the goal.

---

## Features

- **Live training visualization** — policy arrows and value heatmap update in real time as training progresses, streamed episode-by-episode over a WebSocket
- **Snapshot replay** — after training completes, a replay agent traces the greedy path learned at each checkpoint, color-coded from purple (early training) to gold (converged policy)
- **Configurable environment** — paint walls, move the start and goal positions, and set grid size (up to $N \times N$) directly in the UI
- **Hyperparameter controls** — adjust $\epsilon$, $\gamma$, $\alpha$, number of episodes, step limit, and checkpoint frequency via sidebar sliders
- **Training metrics** — live charts for episode return (raw + rolling average), % policy changed per episode, and episode length
- **Display speed** — control how fast the frontend consumes the update queue so you can watch slowly or blaze through to the final result

---

## Architecture

When the user clicks Start Training, the frontend opens a WebSocket connection to the FastAPI backend and immediately sends a JSON payload containing all of the configured hyperparameters: grid size, obstacle layout, start and goal positions, epsilon, gamma, alpha, number of episodes, step limit, and checkpoint frequency.

The backend uses this payload to initialize a fresh environment and agent, then runs the training loop. Every `checkpoint_every` episodes it sends an update message back to the frontend containing everything needed to give a comprehensive picture of the agent's progress at that moment:

- **Q-table** — the full set of action values for every state, which the frontend uses to render the policy arrow overlay (the greedy action at each cell) and the value heatmap (the max Q-value per cell, normalized across the grid so the color scale is always meaningful)
- **Episode return** — the raw undiscounted sum of rewards for that episode, plotted directly on the return chart
- **Rolling average return** — a running average over the most recent 20% of total episodes, plotted alongside the raw return to smooth out noise and show the convergence trend
- **Policy changed %** — the percentage of states whose greedy action changed compared to the previous episode, giving a direct signal of how much the policy is still shifting; as training converges this should trend toward zero
- **Episode length** — how many steps the agent took before reaching the goal or hitting the step limit, which tends to decrease as the policy improves

Because the backend streams these checkpoints incrementally rather than waiting until training finishes, the frontend can animate the heatmap and charts updating in real time. The frontend buffers incoming messages and drains them at a user-controlled display speed, so the visualization pace is decoupled from how fast the backend is actually training.

Once the full training run is complete, the backend sends a final message containing Q-table snapshots at every checkpoint. The frontend uses these to run a sequential replay: an agent is stepped through the grid using the greedy policy from each snapshot in order, color-coded from purple (early training) to gold (converged), so you can see the policy evolving spatially across the entire training history.

The React app is hosted on Vercel and the FastAPI server on Render. The WebSocket URL is injected at build time via a `VITE_API_URL` environment variable, with automatic `http → ws` and `https → wss` protocol substitution for the production environment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS, Recharts |
| Backend | FastAPI, NumPy |
| Transport | WebSockets |
| Hosting | Vercel (frontend), Render (backend) |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install fastapi uvicorn numpy
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:

```
VITE_API_URL=http://localhost:8000
```

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Results

Below are example runs showing the policy and value function at different stages of training on a $7 \times 7$ grid with walls.

<!-- Add screenshots here -->
| Early Training | Mid Training | Converged |
|---|---|---|
| ![early](./assets/early.png) | ![mid](./assets/mid.png) | ![converged](./assets/converged.png) |

The rolling return chart typically shows a sharp improvement phase followed by plateau as the policy converges. SARSA tends to converge to a slightly longer but safer path compared to Q-Learning when walls border the optimal route, which matches the theoretical expectation.

---

## References

- Sutton, R. S., & Barto, A. G. (2018). *Reinforcement Learning: An Introduction* (2nd ed.). MIT Press. — [free PDF](http://incompleteideas.net/book/the-book-2nd.html)
