import { useState, useEffect } from "react";
import RadioCard from "./components/RadioCard";
import {
  Algorithm,
  type SimulationMode,
  type AlgorithmType,
  type TrainingUpdate,
} from "./types";
import { LabeledSlider } from "./components/LabeledSlider";
import type { ArrowDirection, GridData, CellData, CellType } from "./types";
import { GridPanel } from "./components/GridPanel";
import { Select, type SelectChangeEvent } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
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

interface TopRowProps {
  selectedAlgo: AlgorithmType;
  setAlgo: (algo: AlgorithmType) => void;
  simMode: SimulationMode;
  setSimMode: (mode: SimulationMode) => void;
}
// Example of a child component using the new dynamic classes
function TopRow({ selectedAlgo, setAlgo, simMode, setSimMode }: TopRowProps) {
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
            label="SARSA"
            description="On-Policy, TD control"
            value={Algorithm.SARSA}
            selectedValue={selectedAlgo}
            onChange={setAlgo}
            name="algo-group"
          />
        </div>
      </section>

      {/* Simulation Mode Group */}
      <section className="flex flex-row items-center gap-3 accent-pink">
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

interface SideBarProps {
  epsilon: number;
  setEpsilon: (ep: number) => void;
  gamma: number;
  setGamma: (gam: number) => void;
  gridSize: number;
  setGridSize: (gSize: number) => void;
  numEpisodes: number;
  setNumEpisodes: (numEp: number) => void;
  checkpointsEvery: number;
  setCheckpointsEvery: (checkPt: number) => void;
  paintingMode: string;
  setPaintingMode: (paintMode: CellType) => void;
  stepLimit: number;
  setStepLimit: (stepL: number) => void;
  displaySpeed: number;
  setDisplaySpeed: (speed: number) => void;
}
function SideBar({
  epsilon,
  setEpsilon,
  gamma,
  setGamma,
  gridSize,
  setGridSize,
  numEpisodes,
  setNumEpisodes,
  checkpointsEvery,
  setCheckpointsEvery,
  paintingMode,
  setPaintingMode,
  stepLimit,
  setStepLimit,
  displaySpeed,
  setDisplaySpeed,
}: SideBarProps) {
  useEffect(() => {
    // If the number of episodes becomes smaller than our checkpoint interval,
    // pull the checkpoint value down so it doesn't exceed the new max.
    if (checkpointsEvery > numEpisodes) {
      setCheckpointsEvery(numEpisodes);
    }
  }, [numEpisodes, checkpointsEvery]);

  const handlePaintingChange = (event: SelectChangeEvent) => {
    setPaintingMode(event.target.value as CellType);
  };
  return (
    <div className="h-full w-full p-4 border-r border-theme-border bg-theme-panel gap-10">
      <h1 className="opacity-50 pb-5 ">SIM SETUP</h1>

      {/* Animation Speed (Pink Accent) */}
      <section className="accent-pink">
        <LabeledSlider
          title="Animation Display Speed (ms)"
          value={displaySpeed}
          min={10}
          max={1000}
          step={10}
          onChange={setDisplaySpeed}
          color="var(--color-pink-300)"
        />
      </section>

      {/* Size Slider (Blue Accent) */}
      <LabeledSlider
        title="Grid Size "
        value={gridSize}
        min={2}
        max={15}
        step={1}
        onChange={setGridSize}
        color="var(--color-sky-300)"
      />

      {/* make paint mode selection */}
      <FormControl
        sx={{
          m: 1,
          minWidth: 80,
          // Label default + shrunk state
          "& .MuiInputLabel-root": {
            color: "var(--color-theme-text)",
          },
          "& .MuiInputLabel-root.Mui-focused": {
            color: "var(--color-accent)",
          },
          // Outlined border
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-theme-border)",
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "var(--color-accent)",
          },
          "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
            {
              borderColor: "var(--color-accent)",
              boxShadow: "0 0 0 2px var(--color-accent-glow)",
            },
          // Select text + icon
          "& .MuiSelect-select": {
            color: "var(--color-theme-text)",
            backgroundColor: "var(--color-theme-panel)",
          },
          "& .MuiSvgIcon-root": {
            color: "var(--color-accent)",
          },
        }}
      >
        <InputLabel id="demo-simple-select-autowidth-label">Paint</InputLabel>
        <Select
          labelId="demo-simple-select-autowidth-label"
          id="demo-simple-select-autowidth"
          value={paintingMode}
          onChange={handlePaintingChange}
          autoWidth
          label="Paint"
          MenuProps={{
            slotProps: {
              paper: {
                sx: {
                  bgcolor: "var(--color-theme-panel)",
                  border: "1px solid var(--color-theme-border)",
                  "& .MuiMenuItem-root": {
                    color: "var(--color-theme-text)",
                  },
                  "& .MuiMenuItem-root:hover": {
                    bgcolor: "var(--color-accent-glow)",
                    color: "var(--color-accent)",
                  },
                  "& .MuiMenuItem-root.Mui-selected": {
                    bgcolor: "var(--color-accent-glow)",
                    color: "var(--color-accent)",
                  },
                },
              },
            },
          }}
        >
          <MenuItem value={"empty"}>Painting: Empty</MenuItem>
          <MenuItem value={"wall"}>Painting: Wall</MenuItem>
          <MenuItem value={"start"}>Painting: Start</MenuItem>
          <MenuItem value={"goal"}>Painting: Goal</MenuItem>
        </Select>
      </FormControl>

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

      {/* Max Steps */}
      <LabeledSlider
        title="Max Steps"
        value={stepLimit}
        min={0}
        max={1000}
        step={1}
        onChange={setStepLimit}
        color="var(--color-sky-300)"
      />

      {/* Checkpoint Slider (Blue Accent) */}
      <section className="accent-pink">
        <LabeledSlider
          title="Check Point Every X EPS "
          value={checkpointsEvery}
          min={1}
          max={numEpisodes}
          step={1}
          onChange={setCheckpointsEvery}
          color="var(--color-pink-300)"
        />
      </section>
    </div>
  );
}

interface TableViewsProp {
  grid: GridData;
  handleCellClick: (row: number, col: number) => void;
}
function TableViews({ grid, handleCellClick }: TableViewsProp) {
  return (
    <div className="h-full border-b border-theme-border grid grid-cols-3">
      <GridPanel
        title="Snapshot replay"
        tag="live"
        data={grid}
        mode="replay"
        onCellClick={handleCellClick}
      />
      <GridPanel
        title="Policy π(s)"
        tag="arrows"
        data={grid}
        mode="policy"
        onCellClick={handleCellClick}
      />
      {/* //TODO: Change this to reflect the Q, or change whats sent back to be V(S) */}
      <GridPanel
        title="Value table Q(s,a)"
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
              stroke="var(--color-theme-text)"
              opacity={0.5}
              tickLine={false}
            />
            <YAxis
              stroke="var(--color-theme-text)"
              opacity={0.5}
              tickLine={false}
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
              stroke="var(--color-theme-text)"
              opacity={0.5}
              tickLine={false}
            />
            <YAxis
              stroke="var(--color-theme-text)"
              opacity={0.5}
              tickLine={false}
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
              stroke="var(--color-theme-text)"
              opacity={0.5}
              tickLine={false}
            />
            <YAxis
              stroke="var(--color-theme-text)"
              opacity={0.5}
              tickLine={false}
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
  // status → controls which UI is visible
  const [displaySpeed, setDisplaySpeed] = useState(600); // in milliseconds
  const { status, currentUpdate, episodeHistory, snapshots, connect } =
    useTrainingSocket(displaySpeed);
  const [selectedAlgo, setAlgo] = useState<AlgorithmType>(
    Algorithm.MONTE_CARLO,
  );
  const [simMode, setSimMode] = useState<SimulationMode>("editing");

  const [epsilon, setEpsilon] = useState(0.1);
  const [gamma, setGamma] = useState(0.9);
  const [gridSize, setGridSize] = useState(5);
  const [numEpisodes, setNumEpisodes] = useState(500);
  const [checkpointsEvery, setCheckpointsEvery] = useState(
    Math.max(1, Math.trunc(numEpisodes / 10)),
  );
  const [paintingMode, setPaintingMode] = useState<CellType>("wall");
  const [stepLimit, setStepLimit] = useState(500);

  const [startPos, setStartPos] = useState<[number, number]>([0, 0]);
  const [goalPos, setGoalPos] = useState<[number, number]>([
    gridSize - 1,
    gridSize - 1,
  ]);
  const initialGrid: GridData = makeSimpleGrid(gridSize);
  const [grid, setGrid] = useState<GridData>(initialGrid);

  useEffect(() => {
    // if changes to training, start the agent at start then begin training
    // else clear env for next training round
    if (simMode == "training") {
      // send hyper params to backend and start populating the graphs based on web socket data
      console.log("Start Training");
      startTraining();
    } else {
      console.log("Editing World");
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
    console.log(config);
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
  // have to make sure that start and goal isn't overriden by painting
  //TODO: a little ineffecient having to iterate through the list every time painting to search but too lazy to refactor file :/
  function handleCellClick(row: number, col: number) {
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

  return (
    <div className="h-screen w-full flex flex-col bg-theme-bg text-theme-text">
      {/* Header: 10% */}
      <div className="h-[10%] shrink-0">
        <TopRow
          selectedAlgo={selectedAlgo}
          setAlgo={setAlgo}
          simMode={simMode}
          setSimMode={setSimMode}
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
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Table Area: Fixed 60% of the parent height */}
          <div className="h-[60%] shrink-0 border-b border-theme-border p-4 overflow-auto">
            <TableViews grid={grid} handleCellClick={handleCellClick} />
          </div>

          {/* Graphs Area: Fills the remaining ~30% */}
          <div className="flex-1 min-h-0 bg-theme-panel">
            <ResultGraphs episodeHistory={episodeHistory} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
