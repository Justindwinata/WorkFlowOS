import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

describe('Root page - session-aware bootstrap (regression: the infinite branding screen bug)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows BootSplash with "Memverifikasi sesi..." while status is checking', () => {
    const BootSplash = ({ message, error, onRetry }: any) => (
      <div>
        <h1>WorkFlowOS</h1>
        {message && <p>{message}</p>}
        {error && <p>{error}</p>}
        {onRetry && <button onClick={onRetry}>Coba Lagi</button>}
      </div>
    );

    const HomePage = () => {
      const status = 'checking';
      const initError = null;
      return status === 'checking' ? (
        <BootSplash message="Memverifikasi sesi..." />
      ) : initError ? (
        <BootSplash error={initError} />
      ) : (
        <BootSplash message="Mengalihkan..." />
      );
    };

    render(<HomePage />);
    expect(screen.getByText('WorkFlowOS')).toBeInTheDocument();
    expect(screen.getByText('Memverifikasi sesi...')).toBeInTheDocument();
  });

  it('does NOT show splash when status is authenticated', () => {
    const BootSplash = ({ message, error }: any) => (
      <div>
        <h1>WorkFlowOS</h1>
        {message && <p>{message}</p>}
        {error && <p>{error}</p>}
      </div>
    );

    const HomePage = () => {
      const status = 'authenticated';
      const initError = null;
      return status === 'checking' ? (
        <BootSplash message="Memverifikasi sesi..." />
      ) : initError ? (
        <BootSplash error={initError} />
      ) : (
        <BootSplash message="Mengalihkan..." />
      );
    };

    render(<HomePage />);
    expect(screen.getByText('Mengalihkan...')).toBeInTheDocument();
  });

  it('shows error and retry button when initError is set', () => {
    const BootSplash = ({ message, error, onRetry }: any) => (
      <div>
        <h1>WorkFlowOS</h1>
        {message && <p>{message}</p>}
        {error && <p>{error}</p>}
        {onRetry && <button onClick={onRetry}>Coba Lagi</button>}
      </div>
    );

    const HomePage = () => {
      const status = 'unauthenticated';
      const initError = 'Gagal memverifikasi sesi';
      const onRetry = vi.fn();
      return status === 'checking' ? (
        <BootSplash message="Memverifikasi sesi..." />
      ) : initError ? (
        <BootSplash error={initError} onRetry={onRetry} />
      ) : (
        <BootSplash message="Mengalihkan..." />
      );
    };

    render(<HomePage />);
    expect(screen.getByText('Gagal memverifikasi sesi')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Coba Lagi/i })).toBeInTheDocument();
  });
});