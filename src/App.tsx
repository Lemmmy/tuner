import { Options } from "./options/Options.tsx";
import { Tuner } from "./Tuner.tsx";

function App() {
  return <div className="flex flex-col m-4">
    <Options />
    <Tuner />
  </div>;
}

export default App;
