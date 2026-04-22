
from enum import IntEnum
import numpy as np 


class Action (IntEnum):
    UP = 0
    RIGHT =1 
    DOWN = 2
    LEFT = 3

possible_actions = list(range(len(Action)))
class Agent():
    def __init__(self , env_size,  start= (0,0), epsilon = .01, gamma=1):
        self.state  = start 
        self.q_table= np.zeros((env_size, env_size, len(possible_actions))) 
        self.returns= np.zeros((env_size, env_size, len(possible_actions)))
        self.returns_count = np.zeros((env_size, env_size, len(possible_actions)))
        self.policy = np.full((env_size, env_size, len(possible_actions)), 1.0/len(possible_actions)) # each action has a certain prob to be picked in each state. initially random policy (every action equally probable)
        self.gamma = gamma
        self.epsilon = epsilon
    #based on policy for probabilities of the action at that state, return the action chosen 
    #TODO: can make episilon soft and greedy versions later 
    def get_action(self): 
        row, col = self.state 
        #the probs should sum to one 
        action = np.random.choice( possible_actions, p=self.policy[row, col] )
        return action 
    
    #based on its state and the environment it's in, get action, take action, update state and reward 
    #when doing the policy iteration, we will build a list of these actions and rewards  
      



#environment takes in the state and action of the agent then returns the reward obtained and next state 
class Environment():
    
    def __init__(self , size = 10):
        #size has to be at least 2 
        self.size= max (2, size)  
        self.rows = self.size
        self.cols = self.size
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
        elif action == Action.UP and row > 0 and not self.obstacles[row-1, col]:
            row -= 1
        elif action == Action.DOWN and row < self.rows-1 and not self.obstacles[row+1, col]:
            row += 1
            
        next_state = (row, col )
        if next_state == self.terminal:
            reward = 0
        else: 
            reward =-1
            
        return next_state, reward
    
    
    
    
    