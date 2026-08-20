import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { useAuthStore } from '@/lib/auth-store';
import { useRedirectIfAuthenticated } from '@/hooks/useRedirectIfAuthenticated';

let replaceMock = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: replaceMock }),
}));

function TestComponent({ target }: { target?: string }) {
  useRedirectIfAuthenticated(target);
  return <div>Test</div>;
}

describe('useRedirectIfAuthenticated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      status: 'checking',
      isAuthenticated: false,
    });
  });

  it('does NOT redirect when status is checking', () => {
    render(<TestComponent />);
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('redirects to /dashboard when authenticated', async () => {
    useAuthStore.setState({ status: 'authenticated', isAuthenticated: true });

    await act(async () => {
      render(<TestComponent />);
    });

    expect(replaceMock).toHaveBeenCalledWith('/dashboard');
  });

  it('redirects to custom target when provided', async () => {
    useAuthStore.setState({ status: 'authenticated', isAuthenticated: true });

    await act(async () => {
      render(<TestComponent target="/custom" />);
    });

    expect(replaceMock).toHaveBeenCalledWith('/custom');
  });

  it('does NOT redirect when unauthenticated', () => {
    useAuthStore.setState({ status: 'unauthenticated', isAuthenticated: false });
    render(<TestComponent />);
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it('does NOT redirect after store updates from unauthenticated to checking', async () => {
    useAuthStore.setState({ status: 'unauthenticated', isAuthenticated: false });

    await act(async () => {
      render(<TestComponent />);
    });

    expect(replaceMock).not.toHaveBeenCalled();

    act(() => {
      useAuthStore.setState({ status: 'checking', isAuthenticated: false });
    });

    expect(replaceMock).not.toHaveBeenCalled();
  });
});