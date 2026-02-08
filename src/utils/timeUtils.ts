export function parseDuration(input: string): number | null {
    const regex = /(\d+)([smhdw])/gi;
    let totalMs = 0;
    let match;
    let hasMatch = false;

    while ((match = regex.exec(input)) !== null) {
        hasMatch = true;
        const value = parseInt(match[1]);
        const unit = match[2].toLowerCase();

        switch (unit) {
            case 's': totalMs += value * 1000; break;
            case 'm': totalMs += value * 60 * 1000; break;
            case 'h': totalMs += value * 60 * 60 * 1000; break;
            case 'd': totalMs += value * 24 * 60 * 60 * 1000; break;
            case 'w': totalMs += value * 7 * 24 * 60 * 60 * 1000; break;
        }
    }

    return hasMatch ? totalMs : null;
}

import { toDate } from 'date-fns-tz';

export function parseDate(dateStr: string, timeStr: string, timezone: string = 'UTC'): Date | null {
    // Expected format: DD.MM for date, HH:mm for time
    const dateRegex = /^(\d{1,2})\.(\d{1,2})$/;
    const timeRegex = /^(\d{1,2}):(\d{1,2})$/;

    const dateMatch = dateStr.match(dateRegex);
    const timeMatch = timeStr.match(timeRegex);

    if (!dateMatch || !timeMatch) return null;

    const day = parseInt(dateMatch[1]);
    const month = parseInt(dateMatch[2]) - 1; // Month is 0-indexed
    const hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2]);

    const now = new Date();
    // Start with current year
    let year = now.getFullYear();

    // Construct string for parsing: YYYY-MM-DDTHH:mm:00
    // We use toDate from date-fns-tz to parse this "local time" string into a Date object (UTC)
    // based on the provided timezone.

    const pad = (n: number) => n.toString().padStart(2, '0');
    let isoString = `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00`;

    let targetDate = toDate(isoString, { timeZone: timezone });

    // If the constructed date is in the past, assume it's meant for next year
    if (targetDate.getTime() <= now.getTime()) {
        year++;
        isoString = `${year}-${pad(month + 1)}-${pad(day)}T${pad(hour)}:${pad(minute)}:00`;
        targetDate = toDate(isoString, { timeZone: timezone });
    }

    return targetDate;
}

export function formatDateForMySQL(date: Date): string {
    const pad = (num: number) => num.toString().padStart(2, '0');

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}
