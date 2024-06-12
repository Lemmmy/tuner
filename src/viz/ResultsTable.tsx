import clsx from "clsx";
import { scaleLinear } from "d3-scale";
import memoizee from "memoizee";
import { HTMLProps, useMemo } from "react";
import { useSelector } from "react-redux";
import { midiNoteToName } from "../midi.ts";
import { LockedInDetection } from "../state/audioSlice.ts";
import { RootState } from "../state/store.ts";

export function ResultsTable() {
  const lockedIn = useSelector((state: RootState) => state.audio.lockedInDetections);
  const lockedInArray = useMemo(() => Object.values(lockedIn).sort((a, b) => a.midiNote - b.midiNote), [lockedIn]);
  const domain = useMemo(() => {
    const furthestQ1 = Math.max(...lockedInArray.map(d => Math.abs(d.q1Cents)));
    const furthestQ3 = Math.max(...lockedInArray.map(d => Math.abs(d.q3Cents)));
    return Math.max(Math.min(Math.ceil(Math.max(furthestQ1, furthestQ3)) + 5, 50), 10);
  }, [lockedInArray]);

  return <table className="w-full border border-black">
    <thead>
      <tr>
        <Th width={80}>Note</Th>
        <Th width={80}>±cents</Th>
        <Th width={120}>Frequency</Th>
        <Th>Plot (cents)</Th>
      </tr>
    </thead>
    <tbody>
      {lockedInArray.map((detection) => <Result key={detection.midiNote} domain={domain} {...detection} />)}
    </tbody>
  </table>;
}

const barScale = memoizee((domain) => scaleLinear().domain([-domain, domain]).range([0, 100]));

function Result({ q2, midiNote, q1Cents, q2Cents, q3Cents, domain }: LockedInDetection & { domain: number }) {
  const [noteName, octave] = midiNoteToName(midiNote);
  const scale = barScale(domain);
  const q1Pct = scale(q1Cents);
  const q2Pct = scale(q2Cents);
  const q3Pct = scale(q3Cents);

  const noteColor = noteName.match(/#/) ? "bg-black text-white" : "bg-white";
  const barGradient = `linear-gradient(to right,
    #0000 0%,
    #0000 ${q1Pct}%,
    #44aadd ${q1Pct}%,
    #44aadd ${q2Pct}%,
    #eeaa00 ${q2Pct}%,
    #eeaa00 ${q3Pct}%,
    #0000 ${q3Pct}%,
    #0000 100%
  )`;

  return <tr>
    <Td className={clsx("text-center", noteColor)}>{noteName}{octave}</Td>
    <Td className="text-right">{q2Cents >= 0 ? "+" : ""}{q2Cents.toFixed(1)}</Td>
    <Td className="text-right">{q2.toFixed(1)} Hz</Td>
    <Td>
      <div className="flex gap-1">
        {/* Domain min */}
        <div className="w-6 text-xs text-right">-{domain.toFixed(0)}</div>

        <div className="flex border border-gray-500 w-full h-4 relative" style={{ background: barGradient }}>
          {/* Target in center */}
          <div className="w-[1px] bg-black absolute left-1/2 top-0 h-full" />

          {/* q1 */}
          <div className="text-[10px] pr-1 absolute text-right -translate-x-full" style={{ left: `${q1Pct}%` }}>
            {q1Cents.toFixed(1)}
          </div>

          {/* q3 */}
          <div className="text-[10px] pl-1 absolute" style={{ left: `${q3Pct}%` }}>
            {q3Cents.toFixed(1)}
          </div>
        </div>

        {/* Domain max */}
        <div className="w-6 text-xs">+{domain.toFixed(0)}</div>
      </div>
    </Td>
  </tr>;
}

const Td = ({ className, ...props }: HTMLProps<HTMLTableCellElement>) =>
  <td {...props} className={clsx(className, "border border-black px-2")} />;
const Th = ({ className, ...props }: HTMLProps<HTMLTableCellElement>) =>
  <th {...props} className={clsx(className, "border border-black px-2")} />;
