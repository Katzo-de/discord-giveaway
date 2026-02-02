import { describe, it, expect, vi, afterAll, beforeAll } from 'vitest';
import { formatDateForMySQL } from '../../../src/utils/timeUtils';

describe('timeUtils', () => {
    describe('formatDateForMySQL', () => {
        it('should format date correctly', () => {
            // Mock the date to ensure consistent results regardless of when the test is run
            // checking "local" time is tricky in tests running in different envs
            // but we can check the format structure at least.

            const date = new Date(2023, 0, 15, 14, 30, 45); // Jan 15, 2023, 14:30:45 local time
            const formatted = formatDateForMySQL(date);

            expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
            expect(formatted).toBe('2023-01-15 14:30:45');
        });

        it('should pad single digits', () => {
            const date = new Date(2023, 3, 5, 4, 5, 6); // Apr 5, 2023, 04:05:06
            const formatted = formatDateForMySQL(date);

            expect(formatted).toBe('2023-04-05 04:05:06');
        });
    });
});
