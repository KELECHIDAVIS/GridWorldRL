
import { LabeledSlider } from "./components/LabeledSlider";
import { Select, type SelectChangeEvent } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import { useEffect } from "react";

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
  disabled: boolean 
}
export function SideBar({
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
  disabled
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
          min={50}
          max={2000}
          step={50}
          onChange={setDisplaySpeed}
          color="var(--color-pink-300)"
          disabled={disabled}
        />
      </section>

      {/* Size Slider (Blue Accent) */}
      <LabeledSlider
        title="Grid Size "
        value={gridSize}
        min={3}
        max={20}
        step={1}
        onChange={setGridSize}
        color="var(--color-sky-300)"
        disabled={disabled}
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
          disabled={disabled}
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
          min={50}
          max={5000}
          step={100}
          onChange={setNumEpisodes}
          color="var(--color-pink-300)"
          disabled={disabled}
        />
      </section>

      {/* Epsilon Slider (Blue Accent) */}
      <LabeledSlider
        title="Exploration (ε)"
        value={epsilon}
        min={0}
        max={1}
        step={0.05}
        onChange={setEpsilon}
        color="var(--color-sky-300)"
        disabled={disabled}
      />

      {/* Gamma Slider (Pink Accent) */}
      <section className="accent-pink">
        <LabeledSlider
          title="Discount Factor (γ)"
          value={gamma}
          min={0}
          max={1}
          step={0.05}
          onChange={setGamma}
          color="var(--color-pink-300)"
          disabled={disabled}
        />
      </section>

      {/* Max Steps */}
      <LabeledSlider
        title="Max Steps"
        value={stepLimit}
        min={10}
        max={2000}
        step={10}
        onChange={setStepLimit}
        color="var(--color-sky-300)"
        disabled={disabled}
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
          disabled={disabled}
        />
      </section>
    </div>
  );
}