import { type GridData, type TrainingUpdate, type CellData, type ArrowDirection } from "../types";
export function applyTrainingUpdate(
  baseGrid: GridData,
  update: TrainingUpdate,
  startPos: [number, number],
  goalPos: [number, number],
): GridData {
  const arrows: ArrowDirection[] = ["up", "right", "down", "left"];
  const rowDeltas = [-1, 0, 1, 0];
  const colDeltas = [0, 1, 0, -1];

  // build the updated grid first
  const newGrid: GridData = baseGrid.map((row, r) =>
    row.map((cell, c): CellData => {
      if (cell.type === "wall" || cell.type === "start" || cell.type === "goal")
        return cell;
      if (!update.q_table[r]?.[c]) return cell;

      const actions = update.q_table[r][c];
      const bestAction = actions.indexOf(Math.max(...actions));

      return {
        ...cell,
        value: Math.max(...actions),
        arrow: arrows[bestAction],
        isGreedyPath: false,
      };
    }),
  );

  // trace greedy path from start to goal
  const visited = new Set<string>();
  let [r, c] = startPos;
  const maxSteps = baseGrid.length * baseGrid[0].length;

  for (let step = 0; step < maxSteps; step++) {
    const key = `${r},${c}`;
    if (visited.has(key)) break;
    visited.add(key);

    newGrid[r][c] = { ...newGrid[r][c], isGreedyPath: true };

    if (r === goalPos[0] && c === goalPos[1]) break;

    if (!update.q_table[r]?.[c]) break;
    const bestAction = update.q_table[r][c].indexOf(
      Math.max(...update.q_table[r][c]),
    );
    r += rowDeltas[bestAction];
    c += colDeltas[bestAction];

    // guard against walking off the grid
    if (r < 0 || r >= newGrid.length || c < 0 || c >= newGrid[0].length) break;
  }

  return newGrid;
}
