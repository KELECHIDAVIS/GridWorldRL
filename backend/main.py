from fastapi import FastAPI, WebSocket
from environment import Agent, Environment, IntEnum
from algorithms.monte_carlo import monte_carlo
import numpy as np 
from pydantic import BaseModel
from collections import deque

app = FastAPI()
class StateAction(BaseModel):
    state: list[int] # row, col 
    action: int #0 up , 1 right, 2 down, 3 left 

class Algorithm(IntEnum):
    MONTE_CARLO = 0 

#TODO:add a max steps limit so that it's not inf  
@app.websocket('/ws/train')
async def train(websocket: WebSocket):
    await websocket.accept()
    config = await websocket.receive_json()

    # initialize fresh env and agent per connection
    env = Environment(size=config['env_size'])
    env.obstacles = np.array(config['obstacles'])
    env.terminal = tuple(config['terminal'])

    start = tuple(config['start'])
    agent = Agent(env.size, start=start, epsilon=config['epsilon'], gamma=config['gamma'])

    checkpoint_every = config['checkpoint_every']
    policy_snapshots = {}  # ep number -> policy array

    #window will be 20% of total eps 
    window_size = max(1, config['episodes'] // 5) 

    # older returns will be popped for newer ones 
    recent_returns = deque(maxlen=window_size)

    for episode in range(config['episodes']):
        agent.state = start  # reset agent to start before each episode
        G = 0 
        policy_changed_pct = 0 
        visit_counts = [[]]
        episode_length = 0 
        if config['algorithm'] == Algorithm.MONTE_CARLO:
            G, episode_length, visit_counts, policy_changed_pct = monte_carlo(env, agent, config['step_limit'])

        
            

        recent_returns.append(G)

        rolling_avg = sum(recent_returns) / len(recent_returns)

        # save snapshot at checkpoints
        if episode % checkpoint_every == 0 or episode == config['episodes']- 1:
            policy_snapshots[episode] = agent.policy.tolist()
            
            # calculate all metrix needed for results graphs: epi
            await websocket.send_json({
                'type': 'update',
                'episode': episode,
                'q_table': agent.q_table.tolist(),
                'policy': agent.policy.tolist(),
                'episode_return': G,
                'policy_changed_pct': policy_changed_pct,
                'visit_counts': visit_counts.tolist(),
                'episode_length': episode_length, 
                'rolling_return':rolling_avg
            })

    # training done -- send all snapshots for replay
    await websocket.send_json({
        'type': 'complete',
        'snapshots': {str(k): v for k, v in policy_snapshots.items()}
    })
    