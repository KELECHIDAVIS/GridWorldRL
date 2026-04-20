// weird way to do enums in typescript 
export const Algorithm = {
    MONTE_CARLO: 0,
    Q_LEARNING: 1,
    SARSA: 2,
} as const; // This makes the values read-only

// This creates a type that only allows 0, 1, or 2
export type AlgorithmType = typeof Algorithm[keyof typeof Algorithm];

export type SimulationMode = 'training' | 'editing';