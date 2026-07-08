import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProdutoForm from './ProdutoForm';
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

describe('ProdutoForm', () => {
    afterEach(() => jest.clearAllMocks());

    test('exibe erro de validação quando código está vazio', () => {
        render(<ProdutoForm onSuccess={jest.fn()} onCancel={jest.fn()} />);

        fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

        expect(screen.getByText('Código é obrigatório')).toBeInTheDocument();
        expect(API.post).not.toHaveBeenCalled();
    });

    test('exibe erro de validação quando preço não é maior que zero', () => {
        render(<ProdutoForm onSuccess={jest.fn()} onCancel={jest.fn()} />);

        fireEvent.change(screen.getByPlaceholderText('Ex: ELT-001'), { target: { value: 'ELT-999' } });
        fireEvent.change(screen.getByPlaceholderText('Nome do produto'), { target: { value: 'Produto Teste' } });
        fireEvent.change(screen.getByDisplayValue('Selecione uma categoria'), { target: { value: 'Eletrônicos' } });
        fireEvent.change(screen.getByPlaceholderText('29.90'), { target: { value: '0' } });
        fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '5' } });

        fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

        expect(screen.getByText('Preço unitário deve ser maior que zero')).toBeInTheDocument();
        expect(API.post).not.toHaveBeenCalled();
    });

    test('cadastra produto novo com dados válidos', async () => {
        API.post.mockResolvedValueOnce({ data: { id: 10 } });
        render(<ProdutoForm onSuccess={jest.fn()} onCancel={jest.fn()} />);

        fireEvent.change(screen.getByPlaceholderText('Ex: ELT-001'), { target: { value: 'ELT-999' } });
        fireEvent.change(screen.getByPlaceholderText('Nome do produto'), { target: { value: 'Produto Teste' } });
        fireEvent.change(screen.getByDisplayValue('Selecione uma categoria'), { target: { value: 'Eletrônicos' } });
        fireEvent.change(screen.getByPlaceholderText('29.90'), { target: { value: '19.90' } });
        fireEvent.change(screen.getByPlaceholderText('0'), { target: { value: '5' } });

        fireEvent.click(screen.getByRole('button', { name: 'Cadastrar' }));

        await waitFor(() =>
            expect(API.post).toHaveBeenCalledWith('/produtos', {
                codigo: 'ELT-999',
                nome: 'Produto Teste',
                descricao: '',
                categoria: 'Eletrônicos',
                precoUnitario: 19.9,
                quantidadeEstoque: 5,
                status: 'ATIVO'
            })
        );
        expect(await screen.findByText('Produto cadastrado com sucesso!')).toBeInTheDocument();
    });

    test('modo edição pré-preenche os campos e código fica desabilitado', () => {
        const produto = {
            id: 1,
            codigo: 'ELT-001',
            nome: 'Cabo USB-C 2m',
            categoria: 'Eletrônicos',
            precoUnitario: 29.9,
            quantidadeEstoque: 2,
            status: 'ATIVO'
        };

        render(<ProdutoForm produto={produto} onSuccess={jest.fn()} onCancel={jest.fn()} />);

        expect(screen.getByDisplayValue('ELT-001')).toBeDisabled();
        expect(screen.getByDisplayValue('Cabo USB-C 2m')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Atualizar' })).toBeInTheDocument();
    });

    test('atualiza produto existente chamando PUT', async () => {
        API.put.mockResolvedValueOnce({ data: {} });
        const produto = {
            id: 1,
            codigo: 'ELT-001',
            nome: 'Cabo USB-C 2m',
            categoria: 'Eletrônicos',
            precoUnitario: 29.9,
            quantidadeEstoque: 2,
            status: 'ATIVO'
        };

        render(<ProdutoForm produto={produto} onSuccess={jest.fn()} onCancel={jest.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Atualizar' }));

        await waitFor(() => expect(API.put).toHaveBeenCalledWith('/produtos/1', expect.any(Object)));
        expect(await screen.findByText('Produto atualizado com sucesso!')).toBeInTheDocument();
    });
});
