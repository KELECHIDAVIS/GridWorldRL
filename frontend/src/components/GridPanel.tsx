import { GridCell } from './GridCell'
import type { GridData, DisplayMode, ReplayAgent } from '../types'
import { useMemo } from 'react'
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
  
  // overlay agent position onto the grid before rendering
  const displayData = useMemo(() => {
    if (!activeAgent) return data;

    const [r, c] = activeAgent.pos;
    // bounds check in case of stale agent during grid size change
    if (!data[r]?.[c]) return data;
    if (data[r][c].type === "start" || data[r][c].type === "goal") return data;

    // shallow copy only the affected row and cell -- no need to clone the whole grid
    const patched = [...data];
    patched[r] = [...data[r]];
    patched[r][c] = {
      ...data[r][c],
      type: "agent",
      agentColor: activeAgent.color,
      value: activeAgent.id,
    };
    return patched;
  }, [data, activeAgent]);

  return (
    <div className="flex flex-col h-full border-r border-zinc-800 last:border-r-0 ">
      {/* header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 bg-zinc-900 shrink-0">
        <span className="text-xs font-medium text-zinc-300">{title}</span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 border border-zinc-700">
          {tag}
        </span>
      </div>

      {/* body -- containerType: size exposes its dimensions to children as cq units */}
      <div
        className="flex-1 flex items-center justify-center p-3 bg-zinc-950 overflow-hidden"
        style={{ containerType: "size" }}
      >
        {/* cqmin = whichever is smaller: container width or container height */}
        <div style={{ width: "100cqmin", height: "100cqmin" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${size}, 1fr)`,
              width: "100%",
              height: "100%",
              gap: "3px",
              ["--cell-font-size" as string]: `calc(100cqmin / ${size} * 0.30)`, // how much the character takes up in cell
            }}
          >
            {displayData.map((row, r) =>
              row.map((cell, c) => (
                <GridCell
                  key={`${r}-${c}`}
                  data={cell}
                  mode={mode}
                  onClick={() => onCellClick(r, c)}
                />
              )),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}