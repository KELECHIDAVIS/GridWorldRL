import { useState, useEffect } from "react";
import RadioCard from "./components/RadioCard";
import {
  Algorithm,
  type SimulationMode,
  type AlgorithmType,
  type TrainingUpdate,
} from "./types";
import type { ArrowDirection, GridData, CellData, CellType , ReplayAgent} from "./types";
import { GridPanel } from "./components/GridPanel";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useTrainingSocket } from "./hooks/useTrainingSocket";
import { applyTrainingUpdate } from "./utils/applyTrainingUpdate";
import { useSequentialReplay } from "./hooks/useSequentialReplay";
import { SideBar } from "./Sidebar";

interface TopRowProps {
  selectedAlgo: AlgorithmType;
  setAlgo: (algo: AlgorithmType) => void;
  simMode: SimulationMode;
  setSimMode: (mode: SimulationMode) => void;
  disabled:boolean // only for algo selection 
}
// Example of a child component using the new dynamic classes
function TopRow({ selectedAlgo, setAlgo, simMode, setSimMode , disabled }: TopRowProps) {
  return (
    <div className="h-full w-full p-4 border-b border-theme-border flex flex-row justify-between items-center bg-theme-panel">
      {/* title */}
      <section className="flex flex-row items-center  ">
        <h1 className="text-xl font-bold ">Grid World RL</h1>
      </section>

      {/* Algorithm Group */}
      <section className="flex flex-row items-center gap-3 ">
        <h2 className="font-bold mb-4 text-theme-text opacity-50 uppercase text-xs tracking-widest">
          Algorithm
        </h2>
        <div className="flex flex-row gap-3">
          <RadioCard
            label="Monte Carlo"
            description="On policy, First Visit"
            value={Algorithm.MONTE_CARLO}
            selectedValue={selectedAlgo}
            onChange={setAlgo}
            name="algo-group"
            disabled={disabled}
          />
          <RadioCard
            name="algo-group"
            label="Q-Learning"
            description="Temporal Difference"
            value={Algorithm.Q_LEARNING}
            selectedValue={selectedAlgo}
            onChange={setAlgo}
            disabled={disabled}
          />
          <RadioCard
            label="SARSA"
            description="On-Policy, TD control"
            value={Algorithm.SARSA}
            selectedValue={selectedAlgo}
            onChange={setAlgo}
            name="algo-group"
            disabled={disabled}
          />
        </div>
      </section>

      {/* Simulation Mode Group */}
      <section className="flex flex-row items-center gap-3 accent-pink">
        <h2 className="font-bold mb-4 text-theme-text opacity-50 uppercase text-xs tracking-widest">
          Simulation Mode
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



interface TableViewsProp {
  grid: GridData;
  handleCellClick: (row: number, col: number) => void;
  activeAgent: ReplayAgent | null; 
}
function TableViews({ grid, handleCellClick, activeAgent }: TableViewsProp) {
  return (
    <div className="h-full border-b border-theme-border grid grid-cols-3">
      <GridPanel
        title="Snapshot replay"
        tag="live"
        data={grid}
        mode="replay"
        onCellClick={handleCellClick}
        activeAgent = {activeAgent} 
      />
      <GridPanel
        title="Policy π(s)"
        tag="arrows"
        data={grid}
        mode="policy"
        onCellClick={handleCellClick}
      />
      <GridPanel
        title="Value table V(s)"
        tag="heatmap"
        data={grid}
        mode="value"
        onCellClick={handleCellClick}
      />
    </div>
  );
}

interface ResultGraphsProps {
  episodeHistory: TrainingUpdate[];
}
function ResultGraphs({ episodeHistory }: ResultGraphsProps) {

  function computeTicks(values: number[], count = 5): number[] {
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === max) return [min];
    return Array.from(
      { length: count },
      (_, i) => min + (i / (count - 1)) * (max - min),
    );
  }

  const episodeReturnTicks = computeTicks(
    episodeHistory.map((e) => e.episode_return),
  );
  const policyChangedTicks = computeTicks(
    episodeHistory.map((e) => e.policy_changed_pct),
  );
  const episodeLengthTicks = computeTicks(
    episodeHistory.map((e) => e.episode_length),
  );

  return (
    /* Change flex-col to h-full and remove extra padding that might shrink the chart area */
    <div className="h-full w-full flex flex-row px-6 pb-6">
      <div className="flex-1 w-full bg-theme-panel p-4 rounded-lg border border-theme-border overflow-hidden">
        <h1>Episode Return</h1>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={episodeHistory}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-theme-border)"
              vertical={false}
            />
            <XAxis
              dataKey="episode"
              type="number"
              domain={["dataMin", "dataMax"]}
              allowDecimals={false}
              stroke="var(--color-theme-text)"
              opacity={0.5}
              tickLine={false}
              tickCount={5}
            />
            <YAxis
              ticks={episodeReturnTicks}
              tickFormatter={(v) => v.toFixed(1)}
              tickLine={false}
              stroke="var(--color-theme-text)"
              opacity={0.5}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? value.toFixed(2) : value
              }
              contentStyle={{
                backgroundColor: "var(--color-theme-bg)",
                borderColor: "var(--color-theme-border)",
                color: "var(--color-theme-text)",
              }}
            />
            <Legend />
            <Line
              name="Raw Return"
              type="monotone"
              dataKey="episode_return"
              stroke="var(--color-sky-400)"
              strokeWidth={1}
              opacity={0.5}
              dot={false}
            />
            <Line
              name="Rolling Average"
              type="monotone"
              dataKey="rolling_return"
              stroke="var(--color-purple-400)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex-1 w-full bg-theme-panel p-4 rounded-lg border border-theme-border overflow-hidden">
        <h1>% Policy Changed</h1>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={episodeHistory}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-theme-border)"
              vertical={false}
            />
            <XAxis
              dataKey="episode"
              type="number"
              domain={["dataMin", "dataMax"]}
              allowDecimals={false}
              stroke="var(--color-theme-text)"
              opacity={0.5}
              tickLine={false}
              tickCount={5}
            />
            <YAxis
              ticks={policyChangedTicks}
              tickFormatter={(v) => v.toFixed(1)}
              tickLine={false}
              stroke="var(--color-theme-text)"
              opacity={0.5}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? value.toFixed(2) : value
              }
              contentStyle={{
                backgroundColor: "var(--color-theme-bg)",
                borderColor: "var(--color-theme-border)",
                color: "var(--color-theme-text)",
              }}
            />
            <Line
              name="%"
              type="monotone"
              dataKey="policy_changed_pct"
              stroke="var(--color-green-400)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Episode Length */}
      <div className="flex-1 w-full bg-theme-panel p-4 rounded-lg border border-theme-border overflow-hidden">
        <h1>Episode Length</h1>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={episodeHistory}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-theme-border)"
              vertical={false}
            />
            <XAxis
              dataKey="episode"
              type="number"
              domain={["dataMin", "dataMax"]}
              allowDecimals={false}
              stroke="var(--color-theme-text)"
              opacity={0.5}
              tickLine={false}
              tickCount={5}
            />
            <YAxis
              ticks={episodeLengthTicks}
              tickFormatter={(v) => v.toFixed(1)}
              tickLine={false}
              stroke="var(--color-theme-text)"
              opacity={0.5}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === "number" ? value.toFixed(2) : value
              }
              contentStyle={{
                backgroundColor: "var(--color-theme-bg)",
                borderColor: "var(--color-theme-border)",
                color: "var(--color-theme-text)",
              }}
            />
            <Line
              name="Episode Length"
              type="monotone"
              dataKey="episode_length"
              stroke="var(--color-orange-400)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function App() {
  // currentUpdate → feeds GridPanel (grids re-render each drain tick)
  // episodeHistory → feeds your charts (array grows over time)
  // snapshots → feeds replay panel (available after training completes)
  // trainingStatus → controls which UI is visible
  const [displaySpeed, setDisplaySpeed] = useState(300); // in milliseconds
  const { trainingStatus, currentUpdate, episodeHistory, snapshots, connect, reset: trainingReset } =
    useTrainingSocket(displaySpeed);
  const [selectedAlgo, setAlgo] = useState<AlgorithmType>(
    Algorithm.MONTE_CARLO,
  );
  const [simMode, setSimMode] = useState<SimulationMode>("editing");

  const [epsilon, setEpsilon] = useState(0.1);
  const [gamma, setGamma] = useState(0.95);
  const [gridSize, setGridSize] = useState(7);
  const [numEpisodes, setNumEpisodes] = useState(1000);
  const [checkpointsEvery, setCheckpointsEvery] = useState(50);
  const [paintingMode, setPaintingMode] = useState<CellType>("wall");
  const [stepLimit, setStepLimit] = useState(200);

  const [startPos, setStartPos] = useState<[number, number]>([0, 0]);
  const [goalPos, setGoalPos] = useState<[number, number]>([
    gridSize - 1,
    gridSize - 1,
  ]);
  const initialGrid: GridData = makeSimpleGrid(gridSize);
  const [grid, setGrid] = useState<GridData>(initialGrid);
  // fill the tables relevant data in Griddata form based on current update 
  const displayGrid = currentUpdate ? applyTrainingUpdate(grid, currentUpdate,startPos, goalPos) : grid
  const isTraining = simMode === 'training' 

  const uniqueHistory = episodeHistory.filter(
    (entry, i, arr) => arr.findIndex((e) => e.episode === entry.episode) === i,
  );

  const {activeAgent , status:replayStatus, startReplay, reset:replayReset } = useSequentialReplay(startPos, goalPos,displaySpeed, snapshots ); 
  
  useEffect(() => {
    // if changes to training, start the agent at start then begin training
    // else clear env for next training round
    if (simMode == "training") {
      // send hyper params to backend and start populating the graphs based on web socket data
      startTraining();
    } else {
      trainingReset() 
      replayReset()
      // make sure obstacles aren't just reset 
      // const newGrid = makeSimpleGrid(gridSize);
      // setGrid(newGrid);
      // setStartPos([0, 0]);
      // setGoalPos([gridSize - 1, gridSize - 1]);
    }
  }, [simMode]);

  // whenever the grid size changes, update the grid with a new dummy one
  useEffect(() => {
    const newGrid = makeSimpleGrid(gridSize);
    setGrid(newGrid);
    setStartPos([0, 0]);
    setGoalPos([gridSize - 1, gridSize - 1]);
  }, [gridSize]);

  function extractObstacleInfo() {
    let obstacleList: number[][] = Array.from({ length: gridSize }, () =>
      Array(gridSize).fill(0),
    );
    for(let row = 0 ; row<gridSize; row++){
     for (let col = 0; col < gridSize; col++) {
      if(grid[row][col].type =='wall')
        obstacleList[row][col] =1 
     } 
    }
    return obstacleList;
  }

  function makeSimpleGrid(size: number): GridData {
    return Array.from({ length: size }, (_, r) =>
      Array.from({ length: size }, (_, c): CellData => {
        if (r === 0 && c === 0) {
          return { type: "start", row: r, col: c };
        }
        if (r === size - 1 && c === size - 1) {
          return { type: "goal", row: r, col: c };
        }
        // if (r === 1 && c === 0) return { type: "wall", row: r, col: c };
        return {
          type: "empty",
          value: Math.random() * 2 - 1,
          arrow: (["up", "down", "left", "right"] as ArrowDirection[])[
            Math.floor(Math.random() * 4)
          ],
          row: r,
          col: c,
        };
      }),
    );
  }

  function startTraining() {
    // get config as an object
    //based on gridData, get a 2d list of objects, the start pos , and end pos
    const obstacleList = extractObstacleInfo();
    let config = {
      env_size: gridSize,
      obstacles: obstacleList,
      terminal: goalPos,
      start: startPos,
      epsilon,
      gamma,
      checkpoint_every: checkpointsEvery,
      episodes: numEpisodes,
      algorithm: selectedAlgo,
      step_limit: stepLimit,
    };
    // connect to websocket
    connect(config);
  }
  // TODO: depending on the mode will, add obstacles, move start, and stop; walls on one will reflect walls on all since they are all based on the replay grid
  function updateGridElement(
    rowIndex: number,
    colIndex: number,
    cellData: CellData,
  ) {
    setGrid((prevGrid) => {
      if (prevGrid[rowIndex][colIndex].type === cellData.type) return prevGrid;
      return prevGrid.map((row, rIdx) =>
        rIdx === rowIndex
          ? row.map((col, cIdx) => (cIdx === colIndex ? cellData : col))
          : row,
      );
    });
  }
  function sameCoords(a: number[], b: number[]) {
    return a.length === b.length && a.every((val, index) => val === b[index]);
  }
  
  function handleCellClick(row: number, col: number) {
    
    if (simMode != 'editing')
      return;

    const isProtected =
      sameCoords([row, col], startPos) || sameCoords([row, col], goalPos);

    // cannot overwrite a start or goal block
    if (isProtected) return;

    if (paintingMode == "wall" || paintingMode == "empty") {
      updateGridElement(row, col, { type: paintingMode, row, col });
    } else if (paintingMode == "start") {
      //remove start from last pos
      updateGridElement(startPos[0], startPos[1], {
        type: "empty",
        row: startPos[0],
        col: startPos[1],
      });
      updateGridElement(row, col, { type: "start", row, col });
      setStartPos([row, col]);
    } else if (paintingMode == "goal") {
      //remove goal from last pos
      updateGridElement(goalPos[0], goalPos[1], {
        type: "empty",
        row: goalPos[0],
        col: goalPos[1],
      });
      updateGridElement(row, col, { type: "goal", row, col });
      setGoalPos([row, col]);
    }
  }

  //when the training is complete, the replay should start 
  useEffect(()=>{
    if (trainingStatus=='complete'){
      console.log("Start Pos:", ...startPos)
      startReplay(); 
    }
  },[trainingStatus])

  return (
    <div className="h-screen w-full flex flex-col bg-theme-bg text-theme-text">
      {/* Header: 10% */}
      <div className="h-[10%] shrink-0">
        <TopRow
          selectedAlgo={selectedAlgo}
          setAlgo={setAlgo}
          simMode={simMode}
          setSimMode={setSimMode}
          disabled={isTraining}
        />
      </div>

      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Sidebar: 20% width */}
        <div className="w-[20%] shrink-0">
          <SideBar
            epsilon={epsilon}
            setEpsilon={setEpsilon}
            gamma={gamma}
            setGamma={setGamma}
            gridSize={gridSize}
            setGridSize={setGridSize}
            numEpisodes={numEpisodes}
            setNumEpisodes={setNumEpisodes}
            checkpointsEvery={checkpointsEvery}
            setCheckpointsEvery={setCheckpointsEvery}
            paintingMode={paintingMode}
            setPaintingMode={setPaintingMode}
            stepLimit={stepLimit}
            setStepLimit={setStepLimit}
            displaySpeed={displaySpeed}
            setDisplaySpeed={setDisplaySpeed}
            disabled={isTraining}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Table Area: Fixed 60% of the parent height */}
          <div className="h-[60%] shrink-0 border-b border-theme-border p-4 overflow-auto">
            <TableViews
              grid={displayGrid}
              handleCellClick={handleCellClick}
              activeAgent={activeAgent}
            />
          </div>

          {/* Graphs Area: Fills the remaining ~30% */}
          <div className="flex-1 min-h-0 bg-theme-panel">
            <ResultGraphs
              episodeHistory={uniqueHistory}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
