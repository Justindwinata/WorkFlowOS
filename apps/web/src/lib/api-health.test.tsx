import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BackendUnavailableState } from '@/components/BackendUnavailable';

const OVERLAY_TITLE = 'Backend Tidak Tersedia';

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('BackendUnavailableState', () => {
  it('does not show overlay when API is available', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      } as Response)
    );

    render(<BackendUnavailableState />);

    await waitFor(() => {
      expect(screen.queryByText(OVERLAY_TITLE)).not.toBeInTheDocument();
    });
  });

  it('shows overlay when API is unavailable', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 503,
        json: () => Promise.resolve({}),
      } as Response)
    );

    render(<BackendUnavailableState />);

    await waitFor(() => {
      expect(screen.getByText(OVERLAY_TITLE)).toBeInTheDocument();
    });
  });

  it('hides overlay after successful retry', async () => {
    let callCount = 0;
    global.fetch = vi.fn(() => {
      callCount++;
      const isFirst = callCount === 1;
      return Promise.resolve({
        ok: !isFirst,
        status: isFirst ? 503 : 200,
        json: () => Promise.resolve({}),
      } as Response);
    });

    const { rerender } = render(<BackendUnavailableState />);

    await waitFor(() => {
      expect(screen.getByText(OVERLAY_TITLE)).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /Coba Lagi/i });
    retryBtn.click();

    await waitFor(() => {
      expect(screen.queryByText(OVERLAY_TITLE)).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });
});