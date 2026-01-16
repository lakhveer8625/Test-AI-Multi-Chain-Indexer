import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CopyButton from './CopyButton';

describe('CopyButton', () => {
    const mockValue = '0x1234567890abcdef';
    let mockClipboard: { writeText: ReturnType<typeof vi.fn> };

    beforeEach(() => {
        // Mock clipboard API
        mockClipboard = {
            writeText: vi.fn().mockResolvedValue(undefined),
        };
        Object.assign(navigator, { clipboard: mockClipboard });
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    it('should render copy button', () => {
        render(<CopyButton value={mockValue} />);
        const button = screen.getByRole('button', { name: /copy to clipboard/i });
        expect(button).toBeInTheDocument();
    });

    it('should copy value to clipboard when clicked', async () => {
        render(<CopyButton value={mockValue} />);
        const button = screen.getByRole('button', { name: /copy to clipboard/i });

        fireEvent.click(button);

        await waitFor(() => {
            expect(mockClipboard.writeText).toHaveBeenCalledWith(mockValue);
        });
    });

    it('should show success icon after copying', async () => {
        render(<CopyButton value={mockValue} />);
        const button = screen.getByRole('button', { name: /copy to clipboard/i });

        // Initially should show copy icon (check icon path)
        const initialIcon = button.querySelector('svg path');
        expect(initialIcon).toHaveAttribute('d', expect.stringContaining('M8 16H6'));

        fireEvent.click(button);

        await waitFor(() => {
            const checkIcon = button.querySelector('svg path');
            expect(checkIcon).toHaveAttribute('d', 'M5 13l4 4L19 7');
        });
    });

    it('should reset to copy icon after 2 seconds', async () => {
        render(<CopyButton value={mockValue} />);
        const button = screen.getByRole('button', { name: /copy to clipboard/i });

        fireEvent.click(button);

        // Should show check icon
        await waitFor(() => {
            const checkIcon = button.querySelector('svg path');
            expect(checkIcon).toHaveAttribute('d', 'M5 13l4 4L19 7');
        });

        // Fast-forward 2 seconds
        vi.advanceTimersByTime(2000);

        await waitFor(() => {
            const copyIcon = button.querySelector('svg path');
            expect(copyIcon).toHaveAttribute('d', expect.stringContaining('M8 16H6'));
        });
    });

    it('should apply custom className', () => {
        const customClass = 'custom-test-class';
        render(<CopyButton value={mockValue} className={customClass} />);
        const button = screen.getByRole('button', { name: /copy to clipboard/i });

        expect(button).toHaveClass(customClass);
    });

    it('should handle copy failure gracefully', async () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });
        mockClipboard.writeText.mockRejectedValue(new Error('Clipboard API not available'));

        render(<CopyButton value={mockValue} />);
        const button = screen.getByRole('button', { name: /copy to clipboard/i });

        fireEvent.click(button);

        await waitFor(() => {
            expect(consoleError).toHaveBeenCalledWith(
                'Failed to copy!',
                expect.any(Error)
            );
        });

        consoleError.mockRestore();
    });

    it('should have correct default styling', () => {
        render(<CopyButton value={mockValue} />);
        const button = screen.getByRole('button');

        expect(button).toHaveClass('inline-flex', 'items-center', 'justify-center', 'p-1');
    });

    it('should copy different values correctly', async () => {
        const { rerender } = render(<CopyButton value="value1" />);
        const button = screen.getByRole('button');

        fireEvent.click(button);
        await waitFor(() => {
            expect(mockClipboard.writeText).toHaveBeenCalledWith('value1');
        });

        // Update with new value
        rerender(<CopyButton value="value2" />);
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockClipboard.writeText).toHaveBeenCalledWith('value2');
        });
    });
});
