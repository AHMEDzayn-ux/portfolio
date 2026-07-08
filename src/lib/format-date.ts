// Date-only strings ("2020-01-01") parse as UTC midnight, but getFullYear() /
// toLocaleDateString() then read them in the *runtime's* timezone. That makes
// the output depend on where the code runs: the server (UTC) and a browser in a
// timezone behind UTC disagree on the year/month for dates near a boundary,
// which surfaced as a React hydration mismatch (#418) in the client-rendered
// timelines. Pinning every format to UTC makes server and client agree — and
// fixes the off-by-one month that the same drift caused on the cards.

export function formatMonthYear(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}

export function formatYear(date: string): number {
  return new Date(date).getUTCFullYear();
}
