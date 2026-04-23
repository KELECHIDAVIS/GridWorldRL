// components/GridCell.tsx
import type { CellData, DisplayMode } from '../types'

const ARROWS: Record<string, string> = {
  up: '↑', down: '↓', left: '←', right: '→'
}

// value is now normalized [0, 1]: 0 = worst (far from goal), 1 = best (near goal)
function valueToColor(value: number): string {
  const r = Math.round(20 + (1 - value) * 180); // high red when bad
  const g = Math.round(20 + value * 160);        // high green when good
  const b = Math.round(80 - value * 60);
  return `rgb(${r}, ${g}, ${b})`;
}
interface GridCellProps {
  data: CellData
  mode: DisplayMode
  onClick: (row:number , col:number) => void; 
}

export function GridCell({ data, mode, onClick  }: GridCellProps) {
  const base = "w-full h-full flex items-center justify-center text-xs font-mono rounded-sm cursor-pointer select-none transition-all duration-150"

  

  if (data.type === 'wall') {
    return <div className={`${base} bg-zinc-800`} onClick={()=> onClick(data.row, data.col)} style={{ fontSize: 'var(--cell-font-size)' }}/>
  }

  if (data.type === 'start') {
    return (
      <div className={`${base} bg-zinc-900 border border-teal-700 text-teal-400 font-bold text-[10px]`} onClick={()=> onClick(data.row, data.col)} style={{ fontSize: 'var(--cell-font-size)' }}>
        S
      </div>
    )
  }

  if (data.type === 'goal') {
    return (
      <div className={`${base} bg-zinc-900 border border-green-700 text-green-400 font-bold text-[10px]`} onClick={()=> onClick(data.row, data.col)} style={{ fontSize: 'var(--cell-font-size)' }}>
        G
      </div>
    )
  }

  if (data.type === 'agent') {
    return (
      <div
        className={`${base} rounded-full border-2`}
        style={{ borderColor: data.agentColor, background: `${data.agentColor}22`, fontSize: 'var(--cell-font-size)'  }}
        onClick={()=> onClick(data.row, data.col)}
      />
    )
  }

  // empty cell -- render differently based on display mode
  if (mode === 'value' && data.value !== undefined) {
    return (
      <div
        className={`${base} text-[9px]`}
        style={{ background: valueToColor(data.value), color: '#c2c0b6', fontSize: 'var(--cell-font-size)' }}
        onClick={()=> onClick(data.row, data.col)}
      >
        {data.rawValue?.toFixed(2)}
      </div>
    )
  }

  if (mode === 'policy' && data.arrow) {
    const isGreedy =
      data.isGreedyPath && data.type == 'empty';

    return (
      <div
        className={`${base} text-base ${data.isGreedyPath ? "bg-purple-950 border border-purple-700 text-purple-300" : "bg-zinc-900 border border-zinc-800 text-zinc-400"}  ${isGreedy ? "ring-2 ring-purple-400 bg-purple-400/20" : ""}`}
        onClick={() => onClick(data.row, data.col)}
        style={{ fontSize: "var(--cell-font-size)" }}
      >
        {ARROWS[data.arrow]}
      </div>
    );
  }

  // fallback empty cell (replay panel background)
  return (
    <div className={`${base} bg-zinc-900 border border-zinc-800/50`} onClick={()=> onClick(data.row, data.col)} style={{ fontSize: 'var(--cell-font-size)' }} />
  )
}