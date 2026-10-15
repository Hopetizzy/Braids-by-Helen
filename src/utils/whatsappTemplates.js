import { SALON_INFO } from '../data/servicesData.js';

/**
 * Clean phone number input into international Nigerian format
 * Examples:
 *   "0901 018 9746" -> "2349010189746"
 *   "+2349010189746" -> "2349010189746"
 *   "9010189746" -> "2349010189746"
 */
export const sanitizeNigerianPhone = (phone = '') => {
  if (!phone) return SALON_INFO.whatsappNumber;
  const digits = String(phone).replace(/[^0-9]/g, '');

  if (digits.startsWith('234')) {
    return digits;
  }
  if (digits.startsWith('0')) {
    return '234' + digits.slice(1);
  }
  if (digits.length === 10) {
    return '234' + digits;
  }
  return digits.length > 0 ? '234' + digits : SALON_INFO.whatsappNumber;
};

/**
 * Build a valid WhatsApp deep link URL
 */
export const createWhatsAppUrl = (phone, message) => {
  const clean = sanitizeNigerianPhone(phone);
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
};

/**
 * Message created for the customer to send Helen on WhatsApp after booking online
 */
export const generateClientReceiptMessage = ({
  bookingReference,
  customerName,
  serviceName,
  styleChoice,
  date,
  time,
  note,
}) => {
  const details = [
    `Hello Braids by Helen,`,
    ``,
    `I just submitted a booking request online:`,
    `• Reference: ${bookingReference}`,
    `• Client: ${customerName}`,
    `• Service: ${serviceName}${styleChoice ? ` (${styleChoice})` : ''}`,
    `• Date: ${date}`,
    `• Time: ${time}`,
  ];

  if (note && note !== 'None provided') {
    details.push(`• Notes: ${note}`);
  }

  details.push(``);
  details.push(`Please let me know if this slot is available. Thank you!`);

  return details.join('\n');
};

/**
 * Confirmation message sent by Helen to client (AC 4)
 */
export const generateAdminConfirmationMessage = ({
  customerName,
  serviceName,
  date,
  time,
  bookingReference,
}) => {
  return `Hello ${customerName}, your Braids by Helen appointment for ${serviceName} on ${date} at ${time} is confirmed! Reference: ${bookingReference}. We look forward to creating your art!`;
};

/**
 * Reschedule proposal message sent by Helen to client (AC 5)
 */
export const generateAdminRescheduleMessage = ({
  customerName,
  serviceName,
  originalDate,
  originalTime,
  proposedDate,
  proposedTime,
  note,
}) => {
  let message = `Hello ${customerName}, regarding your Braids by Helen appointment request for ${serviceName} on ${originalDate} at ${originalTime}: this slot is unavailable. We would love to offer you ${proposedDate} at ${proposedTime} instead.`;
  if (note && note.trim()) {
    message += ` Note from Helen: ${note.trim()}.`;
  }
  message += ` Please reply to let us know if this works for you!`;
  return message;
};

/**
 * Polite decline message sent by Helen to client (AC 6)
 */
export const generateAdminDeclineMessage = ({
  customerName,
  serviceName,
  date,
  time,
  reason,
  customNote,
}) => {
  let message = `Hello ${customerName}, thank you for reaching out to Braids by Helen. Unfortunately we cannot take your appointment for ${serviceName} on ${date} at ${time} due to: ${reason}.`;
  if (customNote && customNote.trim()) {
    message += ` Additional note: ${customNote.trim()}.`;
  }
  message += ` We apologize for the inconvenience and welcome you to book another date with us!`;
  return message;
};

/**
 * Direct WhatsApp chat opener for Helen to speak with the client
 */
export const generateAdminDirectContactMessage = ({
  customerName,
  serviceName,
  bookingReference,
}) => {
  return `Hello ${customerName}, this is Helen from Braids by Helen regarding your appointment request ${bookingReference} for ${serviceName}.`;
};
