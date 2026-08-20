import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BootSplash } from '@/components/BootSplash';

describe('BootSplash', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays branding and loading message', () => {
    render(<BootSplash message="Memuat aplikasi..." />);
    expect(screen.getByText('WorkFlowOS')).toBeInTheDocument();
    expect(screen.getByText('Enterprise Work Management & Service Operations Platform')).toBeInTheDocument();
    expect(screen.getByText('Memuat aplikasi...')).toBeInTheDocument();
  });

  it('displays custom message', () => {
    render(<BootSplash message="Memverifikasi sesi..." />);
    expect(screen.getByText('Memverifikasi sesi...')).toBeInTheDocument();
  });

  it('displays error state when error is provided', () => {
    render(<BootSplash error="Gagal memverifikasi sesi" />);
    expect(screen.getByText('Gagal memverifikasi sesi')).toBeInTheDocument();
    expect(screen.queryByText('Memuat aplikasi...')).not.toBeInTheDocument();
  });

  it('displays retry button when error and onRetry provided', () => {
    const onRetry = vi.fn();
    render(<BootSplash error="Jaringan tidak stabil" onRetry={onRetry} />);
    
    const retryBtn = screen.getByRole('button', { name: /Coba Lagi/i });
    expect(retryBtn).toBeInTheDocument();
    
    fireEvent.click(retryBtn);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does NOT display retry button when no onRetry provided', () => {
    render(<BootSplash error="Error" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('does NOT display error when error is null', () => {
    render(<BootSplash error={null} message="Normal loading" />);
    expect(screen.getByText('Normal loading')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('displays spinner during loading (not in error mode)', () => {
    const { container } = render(<BootSplash message="Loading..." />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeInTheDocument();
  });

  it('does NOT display spinner during error mode', () => {
    const { container } = render(<BootSplash error="Failed" onRetry={vi.fn()} />);
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).not.toBeInTheDocument();
  });
});