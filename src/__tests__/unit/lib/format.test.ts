import { formatDate, formatTime, formatDateTime } from '@/lib/format';

describe('formatDate', () => {
    it('formats a typical date', () => {
        expect(formatDate('2026-02-22')).toBe('February 22, 2026');
    });

    it('handles January correctly', () => {
        expect(formatDate('2026-01-01')).toBe('January 1, 2026');
    });

    it('handles December 31', () => {
        expect(formatDate('2026-12-31')).toBe('December 31, 2026');
    });

    it('does not shift date due to timezone', () => {
        expect(formatDate('2026-06-15')).toBe('June 15, 2026');
    });
});

describe('formatTime', () => {
    it('formats morning time (AM)', () => {
        expect(formatTime('09:30')).toBe('9:30 AM');
    });

    it('formats noon', () => {
        expect(formatTime('12:00')).toBe('12:00 PM');
    });

    it('formats afternoon time (PM)', () => {
        expect(formatTime('14:45')).toBe('2:45 PM');
    });

    it('formats midnight', () => {
        expect(formatTime('00:00')).toBe('12:00 AM');
    });

    it('formats 11:59 PM', () => {
        expect(formatTime('23:59')).toBe('11:59 PM');
    });
});

describe('formatDateTime', () => {
    it('formats ISO timestamp to human-readable string', () => {
        const result = formatDateTime('2026-02-22T19:00:00.000Z');
        expect(result).toMatch(/February/);
        expect(result).toMatch(/2026/);
        // Note: The exact hour depends on the machine's timezone, 
        // but it should contain at least the month and year correctly.
    });
});
