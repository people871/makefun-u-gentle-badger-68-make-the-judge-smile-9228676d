// "The Welcome-Back Cup" — one warm line for the make.fun bounty
// u-gentle-badger-68-make-the-judge-smile-9228676d.
//
// The line: a barista remembers a regular after three months away and
// writes "welcome back" on the cup. The warmth is the recognition
// itself; the surprise is that it was remembered at all after so long;
// the concrete detail is the hand-written cup carried home like a
// trophy. One sentence, one line, nothing explained twice.
//
// The program writes exactly that line to /output/entry.txt and then
// proves, by reading the file back and comparing bytes, that the file
// on disk is the line that passed the gate. Node 22, no dependencies,
// no network, identical bytes on every run.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

// The entry line. 140 Unicode code points as written; the file gains
// one trailing newline, so the gate counts 141.
const LINE =
  "This morning, the barista remembered my order after three months away, wrote 'welcome back' on the cup, and I carried it home like a trophy.";

// The bounty gate: /output/entry.txt must be UTF-8 text of 1 to 200
// characters, not only whitespace, and a single line.
const MIN_POINTS = 1;
const MAX_POINTS = 200;

// Count code points the way the gate does: spread the string into
// code points so an astral character counts once, not twice.
function countPoints(text: string): number {
  return Array.from(text).length;
}

// Every problem the line has, as a list, so a failure names all of
// them instead of stopping at the first one.
function problems(line: string): string[] {
  const found: string[] = [];
  if (line.length === 0) found.push("the line is empty");
  if (line.trim().length === 0) found.push("the line is only whitespace");
  if (line.includes("\n") || line.includes("\r")) {
    found.push("the entry must be a single line");
  }
  if (line !== line.trim()) {
    found.push("the line must not start or end with whitespace");
  }
  // No control characters and no doubled spaces: a line the judge
  // reads aloud should have nothing invisible hiding in it.
  if (Array.from(line).some((ch) => ch.charCodeAt(0) < 0x20)) {
    found.push("the line must not contain control characters");
  }
  if (line.includes("  ")) {
    found.push("the line must not contain doubled spaces");
  }
  // One sentence: the only sentence terminator sits at the very end.
  const stops = Array.from(line).filter(
    (ch) => ch === "." || ch === "!" || ch === "?",
  );
  if (stops.length !== 1 || line.slice(-1) !== stops[0]) {
    found.push("the entry must be exactly one sentence");
  }
  const size = countPoints(line + "\n");
  if (size < MIN_POINTS || size > MAX_POINTS) {
    found.push(`the file must be ${MIN_POINTS}-${MAX_POINTS} characters, got ${size}`);
  }
  return found;
}

function main(): void {
  const bad = problems(LINE);
  if (bad.length > 0) {
    throw new Error(`entry rejected: ${bad.join("; ")}`);
  }

  const fileText = LINE + "\n";
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", fileText, "utf8");

  // Read the file back and compare the raw bytes: if anything else
  // wrote to the shared /output path, fail loudly instead of
  // shipping a stranger's line. Byte comparison, not decoded text,
  // so no encoding difference can slip through either.
  const onDisk = readFileSync("/output/entry.txt");
  const expected = Buffer.from(fileText, "utf8");
  if (!onDisk.equals(expected)) {
    throw new Error(
      `entry.txt on disk (${onDisk.length} bytes) is not the gated line (${expected.length} bytes)`,
    );
  }

  // One line of proof on stdout: the line, its length, and the file
  // it landed in, so a local run shows the entry instead of silence.
  console.log(
    `wrote /output/entry.txt: ${countPoints(fileText)} characters, 1 line`,
  );
}

main();
