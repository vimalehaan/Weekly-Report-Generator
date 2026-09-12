import {
  buildTaskTrendWeekStarts,
  shiftReportingWeekStart,
} from "../../src/utils/report-week.js";

describe("report-week task trend window", () => {
  it("shifts reporting week starts by whole weeks", () => {
    expect(shiftReportingWeekStart("2026-09-07", -1)).toBe("2026-08-31");
    expect(shiftReportingWeekStart("2026-09-07", 3)).toBe("2026-09-28");
  });

  it("builds eight week starts: four before selected, selected, three after", () => {
    const weeks = buildTaskTrendWeekStarts("2026-09-07");

    expect(weeks).toEqual([
      "2026-08-10",
      "2026-08-17",
      "2026-08-24",
      "2026-08-31",
      "2026-09-07",
      "2026-09-14",
      "2026-09-21",
      "2026-09-28",
    ]);
  });
});
