// import { isSameDay, isSameMonth } from "./date";

// export function calcMonthlyLitres(entries: any[]) {
//   return entries.reduce((total, entry) => {
//     const date = new Date(entry.date);
//     if (isSameMonth(date)) total += entry.litres;
//     return total;
//   }, 0);
// }

// export function calcTodayLitres(entries: any[]) {
//   return entries.reduce((total, entry) => {
//     const date = new Date(entry.date);
//     if (isSameDay(date)) total += entry.litres;
//     return total;
//   }, 0);
// }

// export function calcMonthlyExpense(entries: any[]) {
//   return entries.reduce((total, entry) => {
//     const date = new Date(entry.date);
//     if (isSameMonth(date)) total += entry.litres * entry.rate;
//     return total;
//   }, 0);
// }

// export function calcAvgRateToday(entries: any[]) {
//   let todayLitres = 0;
//   let todayAmount = 0;

//   entries.forEach((entry) => {
//     const date = new Date(entry.date);
//     if (isSameDay(date)) {
//       todayLitres += entry.litres;
//       todayAmount += entry.litres * entry.rate;
//     }
//   });

//   return todayLitres > 0 ? todayAmount / todayLitres : 0;
// }
import { isSameDay, isSameMonth } from "./date";

export function calculateSellerStats(entries: any[]) {
  let monthlyLitres = 0;
  let todayLitres = 0;
  let monthlyExpense = 0;

  const now = new Date();

  for (const entry of entries) {
    const entryDate = new Date(entry.date);

    if (isSameMonth(entryDate, now)) {
      monthlyLitres += entry.litres;
      monthlyExpense += entry.litres * entry.rate;
    }

    if (isSameDay(entryDate, now)) {
      todayLitres += entry.litres;
    }
  }

  return {
    monthlyLitres,
    todayLitres,
    monthlyExpense,
  };
}
