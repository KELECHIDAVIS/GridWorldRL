
from enum import IntEnum
import numpy as np 

class Action (IntEnum):
    UP = 0
    RIGHT =1 
    DOWN = 2
    LEFT = 3

possible_actions = list(range(len(Action)))
class Agent():
    def __init__(self , env_size,  start= (0,0)):
        self.state  = start 
        self.value_table= np.zeros((env_size, env_size)) 
        self.policy = np.full((env_size, env_size, len(possible_actions)), 1.0/len(possible_actions)) # each action has a certain prob to be picked in each state. initially random policy (every action equally probable)
    
    #based on the probabilities of each action at this state, return the action chosen 
    def get_action(self): 
        row, col = self.state 
        #the probs should sum to one 
        action = np.random.choice( possible_actions, p=self.policy[row, col] )
        return action 

#environment takes in the state and action of the agent then returns the reward obtained and next state 
class Environment():
    
    def __init__(self , size = 10):
        #size has to be at least 2 
        self.size= max (2, size)  
        self.terminal = (self.size-1, self.size-1)
        self.obstacles = np.zeros ((self.size, self.size)) # 1 if there is a obstacle there 
    
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
    
    #take in the state of the agent and based on their policy run and episode then return their value functions & policy 
    def episode():
        pass 
    
    