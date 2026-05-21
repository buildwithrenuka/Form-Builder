import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DashboardPage } from './DashboardPage';

const myFormsUseQuery = vi.fn();
const responsesUseQuery = vi.fn();
const analyticsUseQuery = vi.fn();
const setPublishedUseMutation = vi.fn();
const updateUseMutation = vi.fn();
const deleteUseMutation = vi.fn();

vi.mock('../utils/clipboard', () => ({
  copyText: vi.fn().mockResolvedValue(true),
}));

vi.mock('../trpc', () => ({
  trpc: {
    forms: {
      myForms: { useQuery: (...args: unknown[]) => myFormsUseQuery(...args) },
      setPublished: { useMutation: () => setPublishedUseMutation() },
      update: { useMutation: () => updateUseMutation() },
      delete: { useMutation: () => deleteUseMutation() },
    },
    responses: {
      list: { useQuery: (...args: unknown[]) => responsesUseQuery(...args) },
      analytics: { useQuery: (...args: unknown[]) => analyticsUseQuery(...args) },
    },
  },
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    myFormsUseQuery.mockReset();
    responsesUseQuery.mockReset();
    analyticsUseQuery.mockReset();
    setPublishedUseMutation.mockReset();
    updateUseMutation.mockReset();
    deleteUseMutation.mockReset();

    setPublishedUseMutation.mockReturnValue({ mutate: vi.fn(), isPending: false });
    updateUseMutation.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });
    deleteUseMutation.mockReturnValue({ mutate: vi.fn(), isPending: false });
    responsesUseQuery.mockReturnValue({ data: [], isLoading: false, error: null });
    analyticsUseQuery.mockReturnValue({ data: null, isLoading: false, error: null });
  });

  it('shows the correct experience label for globe and library forms', () => {
    myFormsUseQuery.mockReturnValue({
      data: [
        {
          id: '1',
          title: 'India Visa Intake',
          slug: 'india-visa',
          worldTheme: 'india',
          visibility: 'public',
          published: true,
          createdAt: new Date('2024-01-01T00:00:00.000Z'),
        },
        {
          id: '2',
          title: 'Myth Atlas',
          slug: 'myth-atlas',
          worldTheme: 'mythology',
          visibility: 'unlisted',
          published: false,
          createdAt: new Date('2024-01-02T00:00:00.000Z'),
        },
      ],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    render(<DashboardPage playerName="Ava" onBack={() => {}} onLogout={() => {}} onViewForm={() => {}} />);

    expect(screen.getByText(/Globe · India/i)).toBeInTheDocument();
    expect(screen.getByText(/Library · Mythology/i)).toBeInTheDocument();
  });

  it('shows a recovery state when the forms query fails', () => {
    myFormsUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('UNAUTHORIZED'),
      refetch: vi.fn(),
    });

    render(<DashboardPage playerName="Ava" onBack={() => {}} onLogout={() => {}} onViewForm={() => {}} />);

    expect(screen.getByText(/Dashboard could not load your forms/i)).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /Sign Out/i })).toHaveLength(2);
  });
});