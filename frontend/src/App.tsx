import { useState, useEffect } from 'react'
import RadioCard from './components/RadioCard';
import { Algorithm, type SimulationMode, type AlgorithmType } from './types';
import { LabeledSlider } from './components/LabeledSlider';
import type { ArrowDirection, GridData, CellData } from './types';
import { GridPanel } from './components/GridPanel';
import { Select, type SelectChangeEvent } from '@mui/material';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

function makeDummyGrid(size: number): GridData {
  return Array.from({ length: size }, (_, r) =>
    Array.from({ length: size }, (_, c): CellData => {
      if (r === 0 && c === 0) return { type: 'start' }
      if (r === size - 1 && c === size - 1) return { type: 'goal' }
      if (r === 1 && c === 2) return { type: 'wall' }
      return {
        type: 'empty',
        value: Math.random() * 2 - 1,
        arrow: (['up','down','left','right'] as ArrowDirection[])[Math.floor(Math.random()*4)],
      }
    })
  )
}


// Example of a child component using the new dynamic classes
function TopRow(){
  const [selectedAlgo , setAlgo] = useState<AlgorithmType> (Algorithm.MONTE_CARLO); 

  const [simMode, setSimMode] = useState<SimulationMode> ('editing'); 
  return (
    <div  className="h-full w-full p-4 border-b border-theme-border flex flex-row justify-between items-center bg-theme-panel">

      {/* title */}
      <section className='flex flex-row items-center  '>
        <h1 className="text-xl font-bold ">Grid World RL</h1>
      </section>

      {/* Algorithm Group */}
      <section className='flex flex-row items-center gap-3 '>
        <h2 className="font-bold mb-4 text-theme-text opacity-50 uppercase text-xs tracking-widest">
          Algorithm
        </h2>
        <div className="flex flex-row gap-3">
          <RadioCard
          label='Monte Carlo'
          description='On policy, First Visit'
          value= {Algorithm.MONTE_CARLO} 
          selectedValue={selectedAlgo}
          onChange={setAlgo}
          name='algo-group'
          />
          <RadioCard 
            name="algo-group"
            label="Q-Learning"
            description="Temporal Difference"
            value={Algorithm.Q_LEARNING}
            selectedValue={selectedAlgo}
            onChange={setAlgo}
          />
          <RadioCard
            label='SARSA'
            description='On-Policy, TD control'
            value= {Algorithm.SARSA} 
            selectedValue={selectedAlgo}
            onChange={setAlgo}
            name='algo-group'
          />

        </div>
      </section>

      {/* Simulation Mode Group */}
      <section className='flex flex-row items-center gap-3 accent-pink'>
        <h2 className="font-bold mb-4 text-theme-text opacity-50 uppercase text-xs tracking-widest">
          Sim Mode
        </h2>
        <div className="flex flex-row gap-3">
          <RadioCard 
            name="mode-group"
            label="Edit Grid"
            description="Modify Environment"
            value="editing"
            selectedValue={simMode}
            onChange={setSimMode}
          />
          <RadioCard 
            name="mode-group"
            label="Start Training"
            description="Training Will Commence"
            value="training"
            selectedValue={simMode}
            onChange={setSimMode}
          />
          
        </div>
      </section>
    </div>
  );
}

function SideBar(){
  const [epsilon, setEpsilon] = useState(.1); 
  const [gamma, setGamma] = useState(.9); 
  const [gridSize, setGridSize] = useState(5); 
  const [numEpisodes, setNumEpisodes] = useState(500); 
  const [checkpointsEvery, setCheckpointsEvery] = useState(Math.trunc(numEpisodes/2)); 
  const [paintingMode, setPaintingMode] = useState("wall")

  useEffect(() => {
    // If the number of episodes becomes smaller than our checkpoint interval,
    // pull the checkpoint value down so it doesn't exceed the new max.
    if (checkpointsEvery > numEpisodes) {
      setCheckpointsEvery(numEpisodes);
    }
  }, [numEpisodes, checkpointsEvery]);
  
  const handlePaintingChange = (event: SelectChangeEvent)=>{
    setPaintingMode(event.target.value); 
  }
  return(
    <div className="h-full w-full p-4 border-r border-theme-border bg-theme-panel gap-10">
      <h1 className="opacity-50 pb-8">GRID SETUP</h1>
      
      {/* Size Slider (Blue Accent) */}
      <LabeledSlider 
        title="Grid Size "
        value={gridSize}
        min={2}
        max={10}
        step={1}
        onChange={setGridSize}
        color="var(--color-sky-300)" 
      />
      
      <FormControl sx={{ m: 1, minWidth: 80 }}>
          <InputLabel id="demo-simple-select-autowidth-label">Age</InputLabel>
          <Select
            labelId="demo-simple-select-autowidth-label"
            id="demo-simple-select-autowidth"
            value={paintingMode}
            onChange={handlePaintingChange}
            autoWidth
            label="Painting Mode"
          >
            <MenuItem value={20}>Painting: Wall</MenuItem>
            <MenuItem value={21}>Painting: Start</MenuItem>
            <MenuItem value={22}>Painting: Goal</MenuItem>
          </Select>
      </FormControl>
      
      {/* make paint mode selection */}

      <h1 className="opacity-50 pb-5">HYPERPARAMETERS</h1>

      {/* Number of Episodes (Pink Accent) */}
      <section className="accent-pink">
        <LabeledSlider 
          title="Number of Episodes"
          value={numEpisodes}
          min={10}
          max={1000}
          step={10}
          onChange={setNumEpisodes}
          color="var(--color-pink-300)" 
        />
      </section>
      
      {/* Epsilon Slider (Blue Accent) */}
      <LabeledSlider 
        title="Exploration (ε)"
        value={epsilon}
        min={0}
        max={1}
        step={0.01}
        onChange={setEpsilon}
        color="var(--color-sky-300)" 
      />

      {/* Gamma Slider (Pink Accent) */}
      <section className="accent-pink">
        <LabeledSlider 
          title="Discount Factor (γ)"
          value={gamma}
          min={0}
          max={1}
          step={0.01}
          onChange={setGamma}
          color="var(--color-pink-300)" 
        />
      </section>

      <h1 className="opacity-50 pb-5">CHECKPOINTS</h1>
      {/* Checkpoint Slider (Blue Accent) */}
      <LabeledSlider 
        title="Every X EPS "
        value={checkpointsEvery}
        min={1}
        max={numEpisodes}
        step={1}
        onChange={setCheckpointsEvery}
        color="var(--color-sky-300)" 
      />



    </div>
  )
}
function TableViews(){

  const grid = makeDummyGrid(5);
  
  // TODO: depending on the mode will, add obstacles, move start, and stop; walls on one will reflect walls on all since they are all based on the replay grid 
  function handleCellClick(){

  }

  return(
    <div className="h-full border-b border-theme-border grid grid-cols-3">
      <GridPanel title="Snapshot replay"    tag="live"    data={grid} mode="replay" onCellClick={handleCellClick} />
      <GridPanel title="Policy π(s)"        tag="arrows"  data={grid} mode="policy" onCellClick={handleCellClick} />
      <GridPanel title="Value table Q(s,a)" tag="heatmap" data={grid} mode="value" onCellClick={handleCellClick} />
    </div>
  )
}
function App() {

  
  return (
    
    <div className={`h-screen w-full flex flex-col font-sans transition-colors duration-300 bg-theme-bg text-theme-text`}>
      
      <div className="h-[10%]">
        <TopRow  /> 
      </div>

      <div className="flex-1 flex flex-row overflow-hidden">
        <div className="w-[20%]">
          <SideBar/>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="h-[70%] border-b border-theme-border p-4">
             <TableViews/>
          </div>

          <div className="flex-1 p-4 bg-theme-panel">
             <h2 className="font-semibold">Results</h2>
          </div>
        </div>
      </div>

    </div>
  )
}

export default App