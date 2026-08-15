import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { Button } from '@ui';
import { cn } from '@ui';

describe('Button', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click</Button>);
    screen.getByText('Click').click();
    expect(onClick).toHaveBeenCalled();
  });

  it('applies variant classes', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByText('Default')).toHaveClass('bg-primary');
    
    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByText('Destructive')).toHaveClass('bg-destructive');
  });

  it('applies size classes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toHaveClass('h-9');
    
    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByText('Large')).toHaveClass('h-11');
  });

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });
});

describe('cn utility', () => {
  it('joins class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles conditional classes', () => {
    expect(cn('a', true && 'b', false && 'c')).toBe('a b');
  });

  it('handles empty strings', () => {
    expect(cn('a', '', 'b')).toBe('a b');
  });
});