
from enum import Enum

class Action (Enum):
    UP = 0
    RIGHT =1 
    DOWN = 2
    LEFT = 3
    
#environment takes in the state and action of the agent then returns the reward obtained and next state 
class Environment():
    rows =10 
    cols = 10
    start = (0,0)
    terminal = (rows-1, cols-1)
    #TODO: add obstacles
    
    def __init__(self):
        pass
    
    #state of agent would be x,y ; action would be up, right, down, left
    def step (self, state, action):
        x, y = state 
           
        if action == Action.RIGHT and x < self.cols-1 :
            x+=1
        elif action == Action.LEFT and x > 0 :
            x-=1 
        elif action == Action.UP and y < self.rows-1 :
            y+=1
        elif action == Action.DOWN and y > 0 :
            y-=1 
            
        next_state = (x,y)
        if next_state == self.terminal:
            reward = 0
        else: 
            reward =-1
            
        return next_state, reward
    
    