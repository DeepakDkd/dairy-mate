export function useGreeting(): string {
  const hour = new Date().getHours()

  if (hour < 12) {
    return "Good Morning, Admin 👋"
  } else if (hour < 18) {
    return "Good Afternoon, Admin 👋"
  } else {
    return "Good Evening, Admin 👋"
  }
}
