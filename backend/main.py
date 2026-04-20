from fastapi import FastAPI, WebSocket
from environment import Agent, Environment
from pydantic import BaseModel

environment = Environment() 
agent = Agent(environment.size) 

for i in range(10):
    print(agent.get_action())

# app = FastAPI()
# class StateAction(BaseModel):
#     state: list[int] # row, col 
#     action: int #0 up , 1 right, 2 down, 3 left 

# #takes in agent state and action then returns reward and next state 
# @app.put("/step/")
# async def step(state_action:StateAction):
#     next_state, reward = environment.step(state_action.state, state_action.action) 
#     return {"next_state": next_state, "reward": reward}

# #based on agent's current state and policy, runs an episode then returns details through websocket
# @app.put("/episode/")
# async def episode():
#     return {"hello": "world"}