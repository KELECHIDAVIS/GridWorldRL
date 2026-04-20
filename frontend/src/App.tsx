import { useState } from 'react'

// Example of a child component using the new dynamic classes
function TopRow(){
  return (
    // Replaced hardcoded tailwind colors with our dynamic 'themeBorder'
    <div className="h-full w-full p-4 border-b border-theme-border flex justify-between items-center bg-theme-panel">
      <h1 className="text-xl font-bold">Grid World RL</h1>
      
    </div>
  )
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