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
