import { type GridData, type TrainingUpdate, type CellData, type ArrowDirection } from "../types";
export function applyTrainingUpdate(
  baseGrid: GridData,
  update: TrainingUpdate,
): GridData {
  return baseGrid.map((row, r) =>
    row.map((cell, c): CellData => {
      if (cell.type === "wall" || cell.type === "start" || cell.type === "goal")
        return cell;

      const actions = update.q_table[r][c];
      const bestAction = actions.indexOf(Math.max(...actions));
      const arrows: ArrowDirection[] = ["up", "right", "down", "left"];

      return {
        ...cell,
        value: Math.max(...actions), // best Q value → heatmap
        arrow: arrows[bestAction], // greedy action → policy arrow
      };
    }),
  );
}
