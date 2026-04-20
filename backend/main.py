from fastapi import FastAPI, WebSocket
from environment import Agent, Environment, IntEnum
from algorithms.monte_carlo import monte_carlo
import numpy as np 
from pydantic import BaseModel


app = FastAPI()
class StateAction(BaseModel):
    state: list[int] # row, col 
    action: int #0 up , 1 right, 2 down, 3 left 

class Algorithm(IntEnum):
    MONTE_CARLO = 0 


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

    for episode in range(config['episodes']):
        agent.state = start  # reset agent to start before each episode

        if config['algorithm'] == Algorithm.MONTE_CARLO:
            monte_carlo(env, agent)

        # save snapshot at checkpoints
        if episode % checkpoint_every == 0 or episode == config['episodes']- 1:
            policy_snapshots[episode] = agent.policy.tolist()
            await websocket.send_json({
                'type': 'update',
                'episode': episode,
                'q_table': agent.q_table.tolist(),
                'policy': agent.policy.tolist(),
            })

    # training done -- send all snapshots for replay
    await websocket.send_json({
        'type': 'complete',
        'snapshots': {str(k): v for k, v in policy_snapshots.items()}
    })
    