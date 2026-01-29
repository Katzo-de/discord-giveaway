export function parseDuration(input: string): number | null {
    const regex = /^(\d+)([smhdw])$/i;
    const match = input.match(regex);

    if (!match) return null;

    const value = parseInt(match[1]);
    const unit = match[2].toLowerCase();

    switch (unit) {
        case 's': return value * 1000;
        case 'm': return value * 60 * 1000;
        case 'h': return value * 60 * 60 * 1000;
        case 'd': return value * 24 * 60 * 60 * 1000;
        case 'w': return value * 7 * 24 * 60 * 60 * 1000;
        default: return null;
    }
}

export function parseDate(dateStr: string, timeStr: string): Date | null {
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

    let targetDate = new Date(year, month, day, hour, minute);

    // If the constructed date is in the past, assume it's meant for next year
    if (targetDate.getTime() <= now.getTime()) {
        year++;
        targetDate = new Date(year, month, day, hour, minute);
    }

    return targetDate;
}
