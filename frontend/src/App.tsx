import { useState } from 'react'
import RadioCard from './components/RadioCard';
import { Algorithm, type SimulationMode, type AlgorithmType } from './types';

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
  return(
    <div className="h-full w-full p-4 border-r border-theme-border bg-theme-panel">
      <h2 className="font-semibold">GRID SETUP</h2>
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
             <h2 className="font-semibold">Policy & Value Tables</h2>
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