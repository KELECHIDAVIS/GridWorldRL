// components/GridCell.tsx
import type { CellData, DisplayMode } from '../types'

const ARROWS: Record<string, string> = {
  up: '↑', down: '↓', left: '←', right: '→'
}

// maps a value in [-1, 1] to a dark tinted color
function valueToColor(value: number): string {
  if (value > 0) {
    const intensity = Math.round(value * 180)
    return `rgb(${40 - Math.round(value*20)}, ${40 + intensity}, ${80 - Math.round(value*40)})`
  } else {
    const intensity = Math.round(-value * 180)
    return `rgb(${40 + intensity}, ${35 - Math.round(-value*15)}, ${80 - Math.round(-value*40)})`
  }
}

interface GridCellProps {
  data: CellData
  mode: DisplayMode
  onClick?: () => void
}

export function GridCell({ data, mode, onClick }: GridCellProps) {
  const base = "w-full h-full flex items-center justify-center text-xs font-mono rounded-sm cursor-pointer select-none transition-all duration-150"

  

  if (data.type === 'wall') {
    return <div className={`${base} bg-zinc-800`} onClick={onClick} style={{ fontSize: 'var(--cell-font-size)' }}/>
  }

  if (data.type === 'start') {
    return (
      <div className={`${base} bg-zinc-900 border border-teal-700 text-teal-400 font-bold text-[10px]`} onClick={onClick} style={{ fontSize: 'var(--cell-font-size)' }}>
        S
      </div>
    )
  }

  if (data.type === 'goal') {
    return (
      <div className={`${base} bg-zinc-900 border border-green-700 text-green-400 font-bold text-[10px]`} onClick={onClick} style={{ fontSize: 'var(--cell-font-size)' }}>
        G
      </div>
    )
  }

  if (data.type === 'agent') {
    return (
      <div
        className={`${base} rounded-full border-2`}
        style={{ borderColor: data.agentColor, background: `${data.agentColor}22`, fontSize: 'var(--cell-font-size)'  }}
        onClick={onClick}
      />
    )
  }

  // empty cell -- render differently based on display mode
  if (mode === 'value' && data.value !== undefined) {
    return (
      <div
        className={`${base} text-[9px]`}
        style={{ background: valueToColor(data.value), color: '#c2c0b6', fontSize: 'var(--cell-font-size)' }}
        onClick={onClick}
      >
        {data.value.toFixed(2)}
      </div>
    )
  }

  if (mode === 'policy' && data.arrow) {
    return (
      <div
        className={`${base} text-base ${data.isGreedyPath ? 'bg-purple-950 border border-purple-700 text-purple-300' : 'bg-zinc-900 border border-zinc-800 text-zinc-400'}`}
        onClick={onClick}
        style={{ fontSize: 'var(--cell-font-size)' }}
      >
        {ARROWS[data.arrow]}
      </div>
    )
  }

  // fallback empty cell (replay panel background)
  return (
    <div className={`${base} bg-zinc-900 border border-zinc-800/50`} onClick={onClick} style={{ fontSize: 'var(--cell-font-size)' }} />
  )
}