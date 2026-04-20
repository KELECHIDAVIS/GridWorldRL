
from enum import IntEnum
import numpy as np 

class Action (IntEnum):
    UP = 0
    RIGHT =1 
    DOWN = 2
    LEFT = 3
    
#environment takes in the state and action of the agent then returns the reward obtained and next state 
class Environment():
    
    def __init__(self , size = 10):
        #size has to be at least 2 
        self.rows = max (2, size)  
        self.cols = max (2, size)
        self.terminal = (self.rows-1, self.cols-1)
        self.obstacles = np.zeros ((self.rows, self.cols)) # 1 if there is a obstacle there 
    
    #state of agent would be row col  ; action would be up, right, down, left
    #if the agent runs into an obstacle or the edge they remain in the same spot 
    def step (self, state, action):
        row, col = state 
        
        if action == Action.RIGHT and col < self.cols-1  and not self.obstacles[row, col+1]:
            col+=1
        elif action == Action.LEFT and col > 0 and not self.obstacles[row, col-1]:
            col-=1 
        elif action == Action.UP and row < self.rows-1 and not self.obstacles[row+1, col]:
            row+=1
        elif action == Action.DOWN and row > 0 and not self.obstacles[row -1 , col]:
            row-=1 
            
        next_state = (row, col )
        if next_state == self.terminal:
            reward = 0
        else: 
            reward =-1
            
        return next_state, reward
    
    