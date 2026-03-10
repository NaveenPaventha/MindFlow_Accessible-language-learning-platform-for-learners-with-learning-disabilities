import { render } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';
import IconMapping from './IconMapping';

describe('IconMapping Component', () => {
    it('renders an icon successfully', () => {
        const { container } = render(<IconMapping iconName="Home" />);
        // lucide icons render as svg elements
        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('renders fallback HelpCircle when icon not found', () => {
        const { container } = render(<IconMapping iconName="NonExistentIconXYZ" />);
        expect(container.querySelector('svg')).toBeInTheDocument();
    });

    it('applies custom size and color', () => {
        const { container } = render(<IconMapping iconName="Home" size={48} color="red" />);
        const svg = container.querySelector('svg');
        expect(svg).toHaveAttribute('width', '48');
        expect(svg).toHaveAttribute('height', '48');
        expect(svg).toHaveAttribute('stroke', 'red');
    });
});
