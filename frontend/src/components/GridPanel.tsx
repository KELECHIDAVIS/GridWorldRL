import { GridCell } from "./GridCell";
import type { GridData, DisplayMode, ReplayAgent } from "../types";
import { useMemo } from "react";

interface GridPanelProps {
  title: string;
  tag: string;
  data: GridData;
  mode: DisplayMode;
  onCellClick: (row: number, col: number) => void;
  activeAgent?: ReplayAgent | null;
}

export function GridPanel({
  title,
  tag,
  data,
  mode,
  onCellClick,
  activeAgent,
}: GridPanelProps) {
  const size = data.length;

  // Overlay agent position onto the grid before rendering
  // This allows GridCell to treat the agent as just another cell type
  const displayData = useMemo(() => {
    if (!activeAgent) return data;

    const [r, c] = activeAgent.pos;

    // Bounds check in case of stale agent data during grid size changes
    if (!data[r]?.[c]) return data;

    // Don't hide the start or goal markers; only overlay on empty/path cells
    if (data[r][c].type === "start" || data[r][c].type === "goal") return data;

    // Shallow copy only the affected row and cell to keep performance high
    const patched = [...data];
    patched[r] = [...data[r]];
    patched[r][c] = {
      ...data[r][c],
      type: "agent",
      agentColor: activeAgent.color,
      value: activeAgent.id, // This is the episode number for GridCell to render
    };

    return patched;
  }, [data, activeAgent]);

  return (
    <div className="flex flex-col h-full bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden relative">
      {/* Replay Status Overlay: Helps when agents look inconsistent */}
      {activeAgent && (
        <div className="absolute top-12 left-3 z-10 bg-zinc-900/90 px-2 py-1 rounded border border-zinc-700 text-[10px] text-zinc-300 font-mono shadow-xl animate-pulse">
          REPLAYING EP: {activeAgent.id}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900 shrink-0">
        <span className="text-xs font-medium text-zinc-300">{title}</span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700">
          {tag}
        </span>
      </div>

      {/* Grid Body */}
      <div
        className="flex-1 flex items-center justify-center p-3 bg-zinc-950 overflow-hidden"
        style={{ containerType: "size" }}
      >
        {/* Aspect Ratio Box: Ensures grid stays square regardless of container shape */}
        <div style={{ width: "100cqmin", height: "100cqmin" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${size}, 1fr)`,
              width: "100%",
              height: "100%",
              gap: "3px",
              // Dynamically scale font size based on cell width
              ["--cell-font-size" as string]: `calc(100cqmin / ${size} * 0.35)`,
            }}
          >
            {displayData.map((row, r) =>
              row.map((cell, c) => (
                <GridCell
                  key={`${r}-${c}`}
                  data={cell}
                  mode={mode}
                  onClick={onCellClick}
                />
              )),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
