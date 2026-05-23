import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LIBRARY_WORLDS } from '../libraryData';
import { LibraryFormBuilder } from './LibraryFormBuilder';

const mocks = vi.hoisted(() => ({
  createMutateAsync: vi.fn(),
  updateMutateAsync: vi.fn(),
  publishMutateAsync: vi.fn(),
  invalidateListPublic: vi.fn(),
}));

vi.mock('../utils/clipboard', () => ({
  copyText: vi.fn().mockResolvedValue(true),
}));

vi.mock('../trpc', () => ({
  trpc: {
    useUtils: () => ({
      forms: {
        listPublic: {
          invalidate: mocks.invalidateListPublic,
        },
      },
    }),
    forms: {
      create: {
        useMutation: () => ({ mutateAsync: mocks.createMutateAsync, isPending: false }),
      },
      update: {
        useMutation: () => ({ mutateAsync: mocks.updateMutateAsync, isPending: false }),
      },
      setPublished: {
        useMutation: () => ({ mutateAsync: mocks.publishMutateAsync, isPending: false }),
      },
    },
  },
}));

describe('LibraryFormBuilder', () => {
  beforeEach(() => {
    mocks.createMutateAsync.mockReset();
    mocks.updateMutateAsync.mockReset();
    mocks.publishMutateAsync.mockReset();
    mocks.invalidateListPublic.mockReset();
  });

  it('switches from settings to design without leaving the settings panel stuck open', async () => {
    const user = userEvent.setup();

    render(
      <LibraryFormBuilder
        world={LIBRARY_WORLDS[0]}
        onBack={() => {}}
        onLogout={() => {}}
        onPreview={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', { name: /settings/i }));
    expect(screen.getByText(/manage sharing, access, and response rules\./i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^design$/i }));

    await waitFor(() => {
      expect(screen.queryByText(/manage sharing, access, and response rules\./i)).not.toBeInTheDocument();
      expect(screen.getByText(/browse fields, presets, and collections\./i)).toBeInTheDocument();
    });
  });
});