from environment import Environment, Agent, possible_actions

import numpy as np 

# sarsa: richard sutton 6.4
#runs one ep of sarsa on policy 
def sarsa(env:Environment, agent: Agent, step_limit):
    
    # for each step 
    episode_length = 0 
    action = agent.get_action() #choose action from state under policy 
    G = 0 
    # collapse q tables into a 2x2 ([row, col]) table that holds the greedy actions 
    old_greedy_actions = np.argmax(agent.q_table, axis=2)
    while agent.state != env.terminal and step_limit > episode_length:
        current_state = agent.state #save current state 
        next_state , reward = env.step(current_state, action) #take action and acquire next state and reward 
        
        G += reward #keep track of episode's return 
        
        #get next action based on policy  
        agent.state = next_state  
        next_action = agent.get_action()
        
        #incremental update of action value table 
        agent.q_table[current_state[0], current_state[1], action] += agent.alpha*(reward + agent.gamma*agent.q_table[next_state[0], next_state[1],next_action] - agent.q_table[current_state[0], current_state[1], action] )
        
        action = next_action # reuse next_action for the start of the next iteration
        episode_length +=1 
    
    new_greedy_actions = np.argmax(agent.q_table, axis=2) 
    changes = np.sum(old_greedy_actions != new_greedy_actions)
    policy_changed_pct = (changes/ (env.rows * env.cols)) *100
    
    return G , episode_length , policy_changed_pct   
        
        