const DEFAULT_LOCALE = "en-IN";

export function getMonthValue(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function parseMonthValue(value?: string | null) {
  const fallback = new Date();
  const safeValue = value?.trim() || getMonthValue(fallback);
  const match = /^(\d{4})-(\d{2})$/.exec(safeValue);

  if (!match) {
    return getMonthWindow(getMonthValue(fallback));
  }

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;

  if (monthIndex < 0 || monthIndex > 11) {
    return getMonthWindow(getMonthValue(fallback));
  }

  return getMonthWindow(`${year}-${String(monthIndex + 1).padStart(2, "0")}`);
}

export function getMonthWindow(monthValue: string) {
  const [yearPart, monthPart] = monthValue.split("-");
  const year = Number(yearPart);
  const monthIndex = Number(monthPart) - 1;
  const start = new Date(year, monthIndex, 1);
  const end = new Date(year, monthIndex + 1, 1);

  return {
    value: monthValue,
    start,
    end,
    label: start.toLocaleString(DEFAULT_LOCALE, {
      month: "long",
      year: "numeric",
    }),
  };
}

export function getMonthFromSearchParams(searchParams: URLSearchParams) {
  return parseMonthValue(searchParams.get("month"));
}
