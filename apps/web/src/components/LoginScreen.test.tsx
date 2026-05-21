import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginScreen } from './LoginScreen';

const mocks = vi.hoisted(() => ({
  loginMutateAsync: vi.fn(),
  registerMutateAsync: vi.fn(),
  saveSession: vi.fn(),
}));

vi.mock('../auth', () => ({
  saveSession: mocks.saveSession,
}));

vi.mock('../trpc', () => ({
  trpc: {
    auth: {
      login: {
        useMutation: () => ({ mutateAsync: mocks.loginMutateAsync, isPending: false }),
      },
      register: {
        useMutation: () => ({ mutateAsync: mocks.registerMutateAsync, isPending: false }),
      },
    },
  },
}));

describe('LoginScreen', () => {
  beforeEach(() => {
    mocks.loginMutateAsync.mockReset();
    mocks.registerMutateAsync.mockReset();
    mocks.saveSession.mockReset();
  });

  it('logs in with email and persists the API session', async () => {
    const user = userEvent.setup();
    const onLogin = vi.fn();
    mocks.loginMutateAsync.mockResolvedValue({
      token: 'jwt-token',
      user: { name: 'Ava', email: 'ava@example.com' },
    });

    render(<LoginScreen theme="formverse" onLogin={onLogin} onBack={() => {}} />);

    await user.type(screen.getByPlaceholderText('Your email address...'), 'ava@example.com');
    await user.type(screen.getByPlaceholderText('Secret temple code...'), 'hunter2');
    await user.click(screen.getByRole('button', { name: /authenticating|quest|enter|authenticate|unlock|launch/i }));

    await waitFor(() => {
      expect(mocks.loginMutateAsync).toHaveBeenCalledWith({ email: 'ava@example.com', password: 'hunter2' });
      expect(mocks.saveSession).toHaveBeenCalledWith({ name: 'Ava', email: 'ava@example.com' }, 'jwt-token');
    });
  });

  it('shows registration-only fields and blocks mismatched passwords', async () => {
    const user = userEvent.setup();

    render(<LoginScreen theme="formverse" initialMode="register" onLogin={() => {}} onBack={() => {}} />);

    expect(screen.getByPlaceholderText('Your explorer name...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm your code...')).toBeInTheDocument();

    await user.type(screen.getByPlaceholderText('Your explorer name...'), 'Ava');
    await user.type(screen.getByPlaceholderText('Your email address...'), 'ava@example.com');
    await user.type(screen.getByPlaceholderText('Secret temple code...'), 'hunter2');
    await user.type(screen.getByPlaceholderText('Confirm your code...'), 'different');
    await user.click(document.querySelector('button[type="submit"]') as HTMLButtonElement);

    expect(await screen.findByText(/Secret codes do not match!/i)).toBeInTheDocument();
    expect(mocks.registerMutateAsync).not.toHaveBeenCalled();
  });
});