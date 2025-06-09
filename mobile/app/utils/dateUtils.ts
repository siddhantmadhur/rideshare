export function toISOIfValid(dateStr: string, timeStr: string): string {
  if (!dateStr || !timeStr) throw new Error("Missing date or time")

  const date = new Date(dateStr)
  if (isNaN(date.getTime())) throw new Error("Invalid date")

  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!match) throw new Error("Invalid time format")

  let hours = parseInt(match[1], 10)
  const minutes = parseInt(match[2], 10)
  const modifier = match[3].toUpperCase()

  if (modifier === "PM" && hours < 12) hours += 12
  if (modifier === "AM" && hours === 12) hours = 0

  date.setHours(hours, minutes, 0, 0)

  const now = new Date()
  const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
  if (localDate < now) throw new Error("Date must be in the future")


  return date.toISOString()
}




export function convertTo24Hour(time12h: string): string {
    const [time, modifier] = time12h.trim().toUpperCase().split(/(AM|PM)/);
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  