import { render, screen } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import DashboardHome from './DashboardHome';
import { BrowserRouter } from 'react-router-dom';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
    useAuth: () => ({
        user: {
            name: 'Testy McTestface',
            gamification: { xp: 1500, level: 2, currentStreak: 5, badges: [] },
            progress: {}
        }
    })
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key })
}));

// Mock DashboardLayout to just render children
vi.mock('../components/DashboardLayout', () => ({
    __esModule: true,
    default: ({ children }) => <div data-testid="dashboard-layout">{children}</div>
}));

describe('DashboardHome Integration Test', () => {
    it('renders the welcome message with user name', () => {
        render(
            <BrowserRouter>
                <DashboardHome />
            </BrowserRouter>
        );
        
        // It should display 'Welcome back, Testy'
        expect(screen.getByText(/Welcome back, Testy/i)).toBeInTheDocument();
    });

    it('renders user gamification stats correctly', () => {
        render(
            <BrowserRouter>
                <DashboardHome />
            </BrowserRouter>
        );
        
        // XP: 1500
        expect(screen.getByText('1500')).toBeInTheDocument();
        // Level: 2
        expect(screen.getByText('2')).toBeInTheDocument();
        // Streak: 5
        expect(screen.getByText(/5 Day Streak/i)).toBeInTheDocument();
    });
});
