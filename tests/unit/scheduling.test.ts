export function detectShowConflict(
  existingShows: { startTime: string; endTime: string }[],
  newShow: { startTime: string; endTime: string }
) {
  const newStart = parseInt(newShow.startTime.replace(":", ""));
  const newEnd = parseInt(newShow.endTime.replace(":", ""));

  for (const s of existingShows) {
    const existingStart = parseInt(s.startTime.replace(":", ""));
    const existingEnd = parseInt(s.endTime.replace(":", ""));

    if (newStart < existingEnd && newEnd > existingStart) {
      return true; // Overlap conflict
    }
  }
  return false;
}

function testScheduling() {
  console.log("Running Show Scheduling Conflict Unit Tests...");

  const existingShows = [{ startTime: "14:30", endTime: "17:30" }];

  // Test 1: Overlapping show (15:00 - 18:00) -> Should conflict
  const conflict1 = detectShowConflict(existingShows, { startTime: "15:00", endTime: "18:00" });
  if (!conflict1) throw new Error("Conflict detection failed for overlapping show window");
  console.log("✔ Overlapping Show Window Conflict Test Passed");

  // Test 2: Non-overlapping show (18:00 - 21:00) -> Should NOT conflict
  const conflict2 = detectShowConflict(existingShows, { startTime: "18:00", endTime: "21:00" });
  if (conflict2) throw new Error("Conflict detection false positive for non-overlapping show window");
  console.log("✔ Non-Overlapping Show Window Test Passed");
}

testScheduling();
