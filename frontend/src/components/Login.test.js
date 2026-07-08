import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import API from '../api/api';

jest.mock('../api/api', () => ({
    __esModule: true,
    default: {
        post: jest.fn(),
        get: jest.fn(),
        put: jest.fn(),
        delete: jest.fn()
    }
}));

describe('Login', () => {
    afterEach(() => jest.clearAllMocks());

    test('renderiza campos de email, senha e botão de entrar', () => {
        render(<Login onLogin={jest.fn()} />);

        expect(screen.getByText('Email')).toBeInTheDocument();
        expect(screen.getByText('Senha')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    });

    test('login com sucesso chama onLogin com email e senha informados', async () => {
        API.post.mockResolvedValueOnce({ data: { message: 'Login realizado com sucesso' } });
        const onLogin = jest.fn();
        render(<Login onLogin={onLogin} />);

        fireEvent.change(screen.getByPlaceholderText('admin@stock.com'), {
            target: { value: 'admin@stock.com' }
        });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), {
            target: { value: 'admin123' }
        });
        fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

        await waitFor(() =>
            expect(onLogin).toHaveBeenCalledWith(true, 'admin@stock.com', 'admin123')
        );
        expect(API.post).toHaveBeenCalledWith('/auth/login', {
            email: 'admin@stock.com',
            senha: 'admin123'
        });
    });

    test('login inválido exibe mensagem de erro e não chama onLogin', async () => {
        API.post.mockRejectedValueOnce({
            response: { data: { error: 'Email ou senha inválidos' } }
        });
        const onLogin = jest.fn();
        render(<Login onLogin={onLogin} />);

        fireEvent.change(screen.getByPlaceholderText('admin@stock.com'), {
            target: { value: 'errado@stock.com' }
        });
        fireEvent.change(screen.getByPlaceholderText('••••••••'), {
            target: { value: 'senhaerrada' }
        });
        fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

        expect(await screen.findByText('Email ou senha inválidos')).toBeInTheDocument();
        expect(onLogin).not.toHaveBeenCalled();
    });
});
