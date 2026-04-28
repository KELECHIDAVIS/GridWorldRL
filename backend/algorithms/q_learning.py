from environment import Environment, Agent, possible_actions

import numpy as np 

#q learning: richard sutton 6.5
#runs one ep of q learning off policy 
def q_learning(env:Environment, agent: Agent, step_limit): 
    # for each step 
    episode_length = 0 
    G=0 
    old_greedy_actions = np.argmax(agent.q_table, axis=2)
    while agent.state != env.terminal and episode_length < step_limit:
        action = agent.get_action(); #get a from s derived from Q 
        current_state = agent.state 
        next_state, reward = env.step(current_state, action) 
        
        G += reward #keep track of episode's return 

        #get the max action value based on the next state 
        #basically assume the agent takes best action in the next state 
        max_action_value = np.max(agent.q_table[next_state[0], next_state[1]])
        agent.q_table[current_state[0], current_state[1], action] += agent.alpha*(reward + agent.gamma*max_action_value -  agent.q_table[current_state[0], current_state[1], action] )
        
        agent.state = next_state 
        episode_length+=1
    
    new_greedy_actions = np.argmax(agent.q_table, axis=2) 
    changes = np.sum(old_greedy_actions != new_greedy_actions)
    policy_changed_pct = (changes/ (env.rows * env.cols)) *100
    
    return G , episode_length , policy_changed_pct   
    
        
         