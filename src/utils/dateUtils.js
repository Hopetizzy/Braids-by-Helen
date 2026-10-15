/**
 * Date and schedule calculation utilities for Braids by Helen.
 * Provides calendar day generation, slot availability checks, and West Africa Time helpers.
 */

/**
 * Formats a JS Date object into ISO YYYY-MM-DD string
 */
export const formatDateIso = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats an ISO date into friendly salon display text
 * e.g. "Tomorrow, Wednesday, Oct 14"
 */
export const formatDisplayDate = (isoString) => {
  if (!isoString) return '';
  const [year, month, day] = isoString.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const targetZero = new Date(targetDate);
  targetZero.setHours(0, 0, 0, 0);

  const weekday = targetDate.toLocaleDateString('en-US', { weekday: 'long' });
  const monthName = targetDate.toLocaleDateString('en-US', { month: 'short' });
  const dayNum = targetDate.getDate();

  if (targetZero.getTime() === today.getTime()) {
    return `Today, ${weekday}, ${monthName} ${dayNum}`;
  }
  if (targetZero.getTime() === tomorrow.getTime()) {
    return `Tomorrow, ${weekday}, ${monthName} ${dayNum}`;
  }

  return `${weekday}, ${monthName} ${dayNum}`;
};

/**
 * Generates an array of upcoming calendar days starting from today or tomorrow
 */
export const generateUpcomingDays = (daysCount = 14, startOffsetDays = 0) => {
  const days = [];
  const base = new Date();
  base.setHours(0, 0, 0, 0);

  for (let i = startOffsetDays; i < startOffsetDays + daysCount; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);

    const iso = formatDateIso(d);
    days.push({
      dateObj: d,
      iso,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNumber: d.getDate(),
      monthName: d.toLocaleDateString('en-US', { month: 'short' }),
      isToday: i === 0,
      formatted: d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
    });
  }

  return days;
};

/**
 * Checks if a specific date is closed in the schedule
 */
export const isDateAllDayBlocked = (dateIso, scheduleList = []) => {
  if (!dateIso || !Array.isArray(scheduleList)) return false;
  const match = scheduleList.find(s => s.date === dateIso);
  return Boolean(match?.is_all_day);
};

/**
 * Checks if a specific time slot is blocked or confirmed on a date
 */
export const isSlotUnavailable = (dateIso, slotTime, scheduleList = []) => {
  if (!dateIso || !slotTime || !Array.isArray(scheduleList)) return false;
  const match = scheduleList.find(s => s.date === dateIso);
  if (!match) return false;
  if (match.is_all_day) return true;
  return Array.isArray(match.blocked_slots) && match.blocked_slots.includes(slotTime);
};

/**
 * Checks if all slots on a date are blocked or taken
 */
export const isDateFullyBooked = (dateIso, allSlotTimes = [], scheduleList = []) => {
  if (!dateIso || !Array.isArray(scheduleList)) return false;
  const match = scheduleList.find(s => s.date === dateIso);
  if (!match) return false;
  if (match.is_all_day) return true;
  if (!allSlotTimes || allSlotTimes.length === 0) return false;
  
  const blocked = match.blocked_slots || [];
  return allSlotTimes.every(slot => blocked.includes(slot));
};

/**
 * Helper to check if a slot time has already passed for today
 */
export const isSlotInPast = (dateIso, slotTime) => {
  if (!dateIso || !slotTime) return false;
  const todayIso = formatDateIso(new Date());
  if (dateIso !== todayIso) return false;

  // Parse slotTime e.g. "10:30 AM" or "02:00 PM"
  const match = slotTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return false;

  let [_, hours, minutes, meridiem] = match;
  hours = parseInt(hours, 10);
  minutes = parseInt(minutes, 10);

  if (meridiem.toUpperCase() === 'PM' && hours < 12) hours += 12;
  if (meridiem.toUpperCase() === 'AM' && hours === 12) hours = 0;

  const slotDate = new Date();
  slotDate.setHours(hours, minutes, 0, 0);

  return slotDate.getTime() <= Date.now();
};
