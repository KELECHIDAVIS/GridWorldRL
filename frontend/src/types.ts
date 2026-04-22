// weird way to do enums in typescript 
export const Algorithm = {
    MONTE_CARLO: 0,
    Q_LEARNING: 1,
    SARSA: 2,
} as const; // This makes the values read-only

// This creates a type that only allows 0, 1, or 2
export type AlgorithmType = typeof Algorithm[keyof typeof Algorithm];

export type SimulationMode = 'training' | 'editing';

export type CellType = 'empty' | 'wall' | 'start' | 'goal' | 'agent'

export type ArrowDirection = 'up' | 'down' | 'left' | 'right' | null

export interface CellData {
  type: CellType
  value?: number        // for value heatmap display
  arrow?: ArrowDirection  // for policy display
  agentColor?: string   // for replay panel agents
  isGreedyPath?: boolean // highlights the optimal path
  row:number ; 
  col:number
}

export type GridData = CellData[][]  // [row][col]

// what the websocket sends us, converted into GridData
export interface TrainingUpdate {
  episode: number
  q_table: number[][][]   // [row][col][action] 
  policy: number[][][]      // [row][col][action]
  episode_return: number // chart 1 
  policy_changed_pct: number  // for chart 2 -- compute this in Python
  visit_counts: number[][][]    // for chart 3 -- reset each episode
  episode_length: number      // for chart 4
  rolling_return: number
}

export type DisplayMode = 'value' | 'policy' | 'replay'; 