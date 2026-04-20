from environment import Environment, Agent, possible_actions
import numpy as np 
#monte carlo control ES; richard sutton 5.3 
#runs a episode using monte carlo 
def monte_carlo(env:Environment, agent:Agent):
    #generate episode from start following pi 
    states_actions = []
    rewards = []
    while agent.state != env.terminal :
        action = agent.get_action() 
        next_state, reward = env.step(agent.state , action)
        states_actions.append((agent.state, action))
        rewards.append(reward)
        agent.state = next_state
    
    #loop through backwards:
    G = 0
    visited = set()  

    for i in range(len(rewards) - 1, -1, -1):
        G = agent.gamma * G + rewards[i]

        pair = states_actions[i]
        if pair not in visited: #first visit 
            visited.add(pair)

            state, action = pair
            row, col = state

            # incremental average
            agent.returns_count[row, col, action] += 1
            n = agent.returns_count[row, col, action]
            agent.q_table[row, col, action] += (G - agent.q_table[row, col, action]) / n

            # policy improvement
            best_action = np.argmax(agent.q_table[row, col])
            agent.policy[row, col] = agent.epsilon / len(possible_actions)
            agent.policy[row, col, best_action] += 1 - agent.epsilon




