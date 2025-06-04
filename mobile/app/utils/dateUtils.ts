export function toISOIfValid(dateStr?: string, timeStr?: string): string {
    if (!dateStr || !timeStr) {
      throw new Error("Missing date or time");
    }

    const dateParts = dateStr.split("/");
    if (dateParts.length !== 3) {
        throw new Error("Date must be in MM/DD/YYYY format");
    }
  
    // MM/DD/YYYY
    const [monthStr, dayStr, yearStr] = dateStr.split("/");
    const [month, day, year] = [monthStr, dayStr, yearStr].map(Number);
    if (
        isNaN(month) || isNaN(day) || isNaN(year) ||
        month < 1 || month > 12 ||
        day < 1 || day > 31
      ) {
        throw new Error("Invalid date format or values");
      }


    const [time, modifier] = timeStr.trim().toUpperCase().split(/(AM|PM)/);
    let [hours, minutes] = time.split(":").map(Number);
    if (
        isNaN(hours) || isNaN(minutes) ||
        hours < 1 || hours > 12 ||
        minutes < 0 || minutes > 59
      ) {
        throw new Error("Invalid time format");
      }

  
    if (modifier === "PM" && hours < 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;
  
    const iso = new Date(
      `${year}-${monthStr.padStart(2, "0")}-${dayStr.padStart(2, "0")}T${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:00`
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
  