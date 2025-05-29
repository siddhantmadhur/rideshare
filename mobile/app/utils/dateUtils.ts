export function toISOIfValid(dateStr?: string, timeStr?: string): string {
    if (!dateStr || !timeStr) {
      throw new Error("Missing date or time");
    }
  
    // MM/DD/YYYY
    const [month, day, year] = dateStr.split("/");
    const [time, modifier] = timeStr.trim().toUpperCase().split(/(AM|PM)/);
    let [hours, minutes] = time.split(":").map(Number);
  
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
  
    const iso = new Date(
      `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`
    );
  
    if (isNaN(iso.getTime())) {
      throw new Error("Invalid date/time format");
    }
  
    if (iso <= new Date()) {
      throw new Error("Date and time must be in the future");
    }
  
    return iso.toISOString();
  }
  
export function convertTo24Hour(time12h: string): string {
    const [time, modifier] = time12h.trim().toUpperCase().split(/(AM|PM)/);
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }
  