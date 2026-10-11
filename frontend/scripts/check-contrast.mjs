// Verifies every text/background pair in the token set meets WCAG AA (4.5:1).
// Run: node scripts/check-contrast.mjs
const pairs = [
  ["btn primary", "#FFFFFF", "#D32F2F"],
  ["btn primary hover", "#FFFFFF", "#B71C1C"],
  ["btn primary active", "#FFFFFF", "#9A1717"],
  ["brand text on white", "#B71C1C", "#FFFFFF"],
  ["link on white", "#B71C1C", "#FFFFFF"],
  ["badge brand", "#9A1717", "#FDECEC"],
  ["badge green", "#15803D", "#DCFCE7"],
  ["badge green on white", "#15803D", "#FFFFFF"],
  ["badge red", "#991B1B", "#FEE2E2"],
  ["badge amber", "#92400E", "#FEF3C7"],
  ["badge amber on white", "#92400E", "#FFFFFF"],
  ["badge blue", "#1D4ED8", "#DBEAFE"],
  ["badge cyan", "#0E7490", "#CCFBF1"],
  ["badge gray", "#374151", "#F3F4F6"],
  ["ink on white", "#111827", "#FFFFFF"],
  ["body on white", "#4B5563", "#FFFFFF"],
  ["muted on white", "#6B7280", "#FFFFFF"],
  ["muted on soft", "#6B7280", "#F9FAFB"],
  ["error text", "#991B1B", "#FEE2E2"],
  ["ok text", "#15803D", "#DCFCE7"],
  ["toast dark", "#FFFFFF", "#111827"],
  ["toast err", "#FFFFFF", "#7F1D1D"],
  ["toast ok", "#FFFFFF", "#14532D"],
  ["toast info", "#FFFFFF", "#B71C1C"],
  ["field error", "#991B1B", "#FFFFFF"],
  ["strength fair", "#B45309", "#FFFFFF"],
  ["seg selected", "#B71C1C", "#FFFFFF"],
  ["seg idle", "#4B5563", "#F3F4F6"],
  ["eye btn", "#6B7280", "#FFFFFF"],
  ["tab selected", "#B71C1C", "#FFFFFF"],
  ["accent on dark", "#FF4D2B", "#1A0A0A"],
  ["white on red band", "#FFFFFF", "#C1272D"],
];

function lum(hex) {
  const c = hex.replace("#", "");
  const rgb = [0, 2, 4].map((i) => {
    const v = parseInt(c.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
const ratio = (fg, bg) => {
  const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
  return (a + 0.05) / (b + 0.05);
};

let fail = 0;
for (const [name, fg, bg] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= 4.5;
  if (!ok) fail++;
  console.log(`${ok ? "PASS" : "FAIL"} ${r.toFixed(2)}:1  ${name} (${fg} on ${bg})`);
}
console.log(fail ? `\n${fail} pair(s) below 4.5:1` : "\nAll pairs meet WCAG AA (4.5:1).");
process.exit(fail ? 1 : 0);
