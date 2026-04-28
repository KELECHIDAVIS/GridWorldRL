from environment import Environment, Agent, possible_actions
import numpy as np 
#monte carlo control ES; richard sutton 5.3 
#runs a episode using monte carlo 
def monte_carlo(env: Environment, agent: Agent, step_limit):
    states_actions = []
    rewards = []
    step = 0

    while agent.state != env.terminal and step < step_limit:
        action = agent.get_action()
        next_state, reward = env.step(agent.state, action)
        states_actions.append((agent.state, action))
        rewards.append(reward)
        agent.state = next_state
        step += 1

    G = 0
    visited = set()
    # collapse q tables into a 2x2 ([row, col]) table that holds the greedy actions 
    old_greedy_actions = np.argmax(agent.q_table, axis=2)

    for i in range(len(rewards) - 1, -1, -1):
        G = agent.gamma * G + rewards[i]

        pair = states_actions[i]
        state, action = pair
        row, col = state


        if pair not in visited:
            visited.add(pair)
            agent.returns_count[row, col, action] += 1
            n = agent.returns_count[row, col, action]
            agent.q_table[row, col, action] += (G - agent.q_table[row, col, action]) / n

    new_greedy_actions = np.argmax(agent.q_table, axis=2)
    changes = np.sum(old_greedy_actions != new_greedy_actions)
    policy_changed_pct = (changes / (env.rows * env.cols)) * 100

    episode_length = len(rewards)
    return G, episode_length, policy_changed_pct




