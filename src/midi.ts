const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function midiNoteToName(note: number): [string, number] {
  const roundedNote = Math.round(note);
  const name = noteNames[roundedNote % 12];
  const octave = Math.floor(roundedNote / 12) - 1;
  return [name, octave]
}

export function midiNoteToCents(note: number): number {
  const roundedNote = Math.round(note);
  return (note - roundedNote) * 100;
}

export function midiNoteToNameAndCents(note: number): [string, number, number] {
  return [...midiNoteToName(note), midiNoteToCents(note)];
}

export function midiNameToNote(name: string): number {
  const [, noteName, octave] = name.match(/([A-G]#?)(\d+)/) || [];
  if (!noteName) return NaN;

  const note = noteNames.indexOf(noteName);
  if (note === -1) return NaN;

  return note + 12 * (parseInt(octave) + 1);
}

export const freqToMidiNote = (freq: number, referenceFreq = 440) => 69 + 12 * Math.log2(freq / referenceFreq);
export const midiNoteToFreq = (note: number, referenceFreq = 440) => referenceFreq * 2 ** ((note - 69) / 12);
