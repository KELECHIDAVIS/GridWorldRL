from environment import Environment, Agent, possible_actions
import numpy as np 
#monte carlo control ES; richard sutton 5.3 
#runs a episode using monte carlo 
def monte_carlo(env:Environment, agent:Agent, step_limit):
    #generate episode from start following pi 
    states_actions = []
    rewards = []
    policy_changed_pct = 0 
    old_greedy_actions = np.argmax(agent.q_table, axis=2)
    step = 0 
    while agent.state != env.terminal and step < step_limit:
        action = agent.get_action() 
        next_state, reward = env.step(agent.state , action)
        states_actions.append((agent.state, action))
        rewards.append(reward)
        agent.state = next_state
        step+= 1 
    

    #loop through backwards:
    G = 0
    visited = set()  
    visit_counts = np.zeros((env.rows, env.cols))

    for i in range(len(rewards) - 1, -1, -1):
        G = agent.gamma * G + rewards[i]

        pair = states_actions[i]
        if pair not in visited: # first visit 
            visited.add(pair)

            state, action = pair
            row, col = state

            agent.returns_count[row, col, action] += 1
            n = agent.returns_count[row, col, action]
            agent.q_table[row, col, action] += (G - agent.q_table[row, col, action]) / n

            best_action = np.argmax(agent.q_table[row, col])
            agent.policy[row, col] = agent.epsilon / len(possible_actions)
            agent.policy[row, col, best_action] += 1 - agent.epsilon

        state, action = pair          # unpack properly outside the block too
        row, col = state
        visit_counts[row, col] += 1
    
    episode_length = len (rewards)

    new_greedy_actions = np.argmax(agent.q_table, axis=2)
    changes = np.sum(old_greedy_actions != new_greedy_actions)
    policy_changed_pct = (changes / (env.rows * env.cols)) * 100

    return G, episode_length, visit_counts, policy_changed_pct #return the episode's return




