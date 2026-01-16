import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Header from './Header';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
    usePathname: vi.fn(() => '/'),
}));

vi.mock('next/link', () => ({
    default: ({ children, href, ...props }: any) => (
        <a href={href} {...props}>
            {children}
        </a>
    ),
}));

describe('Header', () => {
    beforeEach(() => {
        // Reset mocks before each test
        vi.clearAllMocks();
        delete (window as any).location;
        (window as any).location = { href: '' };
    });

    it('should render the logo and app name', () => {
        render(<Header />);
        expect(screen.getByText(/MultiScan/i)).toBeInTheDocument();
    });

    it('should render all navigation links', () => {
        render(<Header />);
        expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /transactions/i })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /blocks/i })).toBeInTheDocument();
    });

    it('should render search input', () => {
        render(<Header />);
        const searchInput = screen.getByPlaceholderText(/search by address/i);
        expect(searchInput).toBeInTheDocument();
    });

    it('should render live status indicator', () => {
        render(<Header />);
        expect(screen.getByText(/live/i)).toBeInTheDocument();
    });

    describe('Search functionality', () => {
        it('should handle transaction hash search (66 characters)', () => {
            render(<Header />);
            const searchInput = screen.getByPlaceholderText(/search by address/i);
            const txHash = '0x' + 'a'.repeat(64); // 66 chars total

            fireEvent.change(searchInput, { target: { value: txHash } });
            fireEvent.submit(searchInput.closest('form')!);

            expect(window.location.href).toBe(`/transactions/${txHash}`);
        });

        it('should handle address search (42 characters)', () => {
            render(<Header />);
            const searchInput = screen.getByPlaceholderText(/search by address/i);
            const address = '0x' + 'b'.repeat(40); // 42 chars total

            fireEvent.change(searchInput, { target: { value: address } });
            fireEvent.submit(searchInput.closest('form')!);

            expect(window.location.href).toBe(`/wallet/${address}`);
        });

        it('should handle block number search', () => {
            render(<Header />);
            const searchInput = screen.getByPlaceholderText(/search by address/i);

            fireEvent.change(searchInput, { target: { value: '12345' } });
            fireEvent.submit(searchInput.closest('form')!);

            expect(window.location.href).toBe('/block/12345');
        });

        it('should not search with empty query', () => {
            const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => { });
            render(<Header />);
            const searchInput = screen.getByPlaceholderText(/search by address/i);

            fireEvent.change(searchInput, { target: { value: '   ' } });
            fireEvent.submit(searchInput.closest('form')!);

            expect(window.location.href).toBe('');
            expect(consoleLog).not.toHaveBeenCalled();
            consoleLog.mockRestore();
        });

        it('should handle generic search query', () => {
            const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => { });
            render(<Header />);
            const searchInput = screen.getByPlaceholderText(/search by address/i);

            fireEvent.change(searchInput, { target: { value: 'some random text' } });
            fireEvent.submit(searchInput.closest('form')!);

            expect(consoleLog).toHaveBeenCalledWith('Generic search:', 'some random text');
            consoleLog.mockRestore();
        });

        it('should trim search query', () => {
            render(<Header />);
            const searchInput = screen.getByPlaceholderText(/search by address/i);

            fireEvent.change(searchInput, { target: { value: '  12345  ' } });
            fireEvent.submit(searchInput.closest('form')!);

            expect(window.location.href).toBe('/block/12345');
        });

        it('should update input value as user types', () => {
            render(<Header />);
            const searchInput = screen.getByPlaceholderText(/search by address/i) as HTMLInputElement;

            fireEvent.change(searchInput, { target: { value: 'test value' } });

            expect(searchInput.value).toBe('test value');
        });
    });

    describe('Active navigation link highlighting', () => {
        it('should highlight active link based on pathname', () => {
            const { usePathname } = require('next/navigation');
            usePathname.mockReturnValue('/transactions');

            render(<Header />);
            const transactionsLink = screen.getByRole('link', { name: /transactions/i });

            expect(transactionsLink).toHaveClass('bg-blue-50', 'text-blue-600');
        });

        it('should not highlight inactive links', () => {
            const { usePathname } = require('next/navigation');
            usePathname.mockReturnValue('/transactions');

            render(<Header />);
            const homeLink = screen.getByRole('link', { name: /^home$/i });

            expect(homeLink).not.toHaveClass('bg-blue-50');
            expect(homeLink).toHaveClass('text-zinc-600');
        });

        it('should highlight link for child routes', () => {
            const { usePathname } = require('next/navigation');
            usePathname.mockReturnValue('/transactions/0x123');

            render(<Header />);
            const transactionsLink = screen.getByRole('link', { name: /transactions/i });

            expect(transactionsLink).toHaveClass('bg-blue-50', 'text-blue-600');
        });

        it('should only highlight home when on exact home path', () => {
            const { usePathname } = require('next/navigation');
            usePathname.mockReturnValue('/');

            render(<Header />);
            const homeLink = screen.getByRole('link', { name: /^home$/i });

            expect(homeLink).toHaveClass('bg-blue-50', 'text-blue-600');
        });
    });

    describe('Navigation links', () => {
        it('should have correct href for Home', () => {
            render(<Header />);
            const homeLink = screen.getByRole('link', { name: /^home$/i });
            expect(homeLink).toHaveAttribute('href', '/');
        });

        it('should have correct href for Transactions', () => {
            render(<Header />);
            const transactionsLink = screen.getByRole('link', { name: /transactions/i });
            expect(transactionsLink).toHaveAttribute('href', '/transactions');
        });

        it('should have correct href for Blocks', () => {
            render(<Header />);
            const blocksLink = screen.getByRole('link', { name: /blocks/i });
            expect(blocksLink).toHaveAttribute('href', '/blocks');
        });
    });
});
