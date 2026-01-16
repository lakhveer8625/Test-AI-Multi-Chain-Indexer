import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatTimeAgo, shortenHash } from './format';

describe('Format Utilities', () => {
    describe('formatTimeAgo', () => {
        beforeEach(() => {
            // Mock Date.now() to have consistent test results
            vi.useFakeTimers();
            vi.setSystemTime(new Date('2024-01-15T12:00:00.000Z'));
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('should format seconds correctly', () => {
            const thirtySecondsAgo = new Date('2024-01-15T11:59:30.000Z').toISOString();
            expect(formatTimeAgo(thirtySecondsAgo)).toBe('30s ago');
        });

        it('should format minutes correctly', () => {
            const tenMinutesAgo = new Date('2024-01-15T11:50:00.000Z').toISOString();
            expect(formatTimeAgo(tenMinutesAgo)).toBe('10m ago');
        });

        it('should format hours correctly', () => {
            const twoHoursAgo = new Date('2024-01-15T10:00:00.000Z').toISOString();
            expect(formatTimeAgo(twoHoursAgo)).toBe('2h ago');
        });

        it('should format days correctly', () => {
            const threeDaysAgo = new Date('2024-01-12T12:00:00.000Z').toISOString();
            expect(formatTimeAgo(threeDaysAgo)).toBe('3d ago');
        });

        it('should handle future timestamps as 0 seconds', () => {
            const futureTime = new Date('2024-01-15T13:00:00.000Z').toISOString();
            expect(formatTimeAgo(futureTime)).toBe('0s ago');
        });

        it('should handle edge case: exactly 60 seconds', () => {
            const sixtySecondsAgo = new Date('2024-01-15T11:59:00.000Z').toISOString();
            expect(formatTimeAgo(sixtySecondsAgo)).toBe('1m ago');
        });

        it('should handle edge case: exactly 24 hours', () => {
            const twentyFourHoursAgo = new Date('2024-01-14T12:00:00.000Z').toISOString();
            expect(formatTimeAgo(twentyFourHoursAgo)).toBe('1d ago');
        });
    });

    describe('shortenHash', () => {
        it('should shorten long hash with default size', () => {
            const longHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef';
            expect(shortenHash(longHash)).toBe('0x12345678...cdef');
        });

        it('should shorten hash with custom size', () => {
            const longHash = '0x1234567890abcdef1234567890abcdef1234567890abcdef';
            expect(shortenHash(longHash, 6)).toBe('0x1234...cdef');
        });

        it('should return original hash if shorter than limit', () => {
            const shortHash = '0x123';
            expect(shortenHash(shortHash)).toBe('0x123');
        });

        it('should handle undefined value', () => {
            expect(shortenHash(undefined)).toBe('-');
        });

        it('should handle empty string', () => {
            expect(shortenHash('')).toBe('-');
        });

        it('should handle hash exactly at the threshold', () => {
            const hash = '0x123456789012'; // length = 14 (size 10 + 4)
            expect(shortenHash(hash, 10)).toBe('0x123456789012');
        });

        it('should preserve entire hash if just above threshold', () => {
            const hash = '0x12345678901234'; // length = 16
            expect(shortenHash(hash, 10)).toBe('0x1234567890...1234');
        });
    });
});
