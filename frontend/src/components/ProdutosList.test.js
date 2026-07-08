import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProdutosList from './ProdutosList';
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

const produtoMock = {
    id: 1,
    codigo: 'ELT-001',
    nome: 'Cabo USB-C 2m',
    categoria: 'Eletrônicos',
    precoUnitario: 29.9,
    quantidadeEstoque: 2,
    status: 'ATIVO'
};

describe('ProdutosList', () => {
    afterEach(() => jest.clearAllMocks());

    test('carrega e exibe os produtos ao montar', async () => {
        API.get.mockResolvedValueOnce({ data: [produtoMock] });

        render(<ProdutosList onEdit={jest.fn()} refresh={false} />);

        expect(await screen.findByText('ELT-001')).toBeInTheDocument();
        expect(screen.getByText('Cabo USB-C 2m')).toBeInTheDocument();
        expect(screen.getByText('Ativo', { selector: '.badge' })).toBeInTheDocument();
        expect(API.get).toHaveBeenCalledWith('/produtos', { params: {} });
    });

    test('exibe mensagem quando não há produtos', async () => {
        API.get.mockResolvedValueOnce({ data: [] });

        render(<ProdutosList onEdit={jest.fn()} refresh={false} />);

        expect(await screen.findByText('Nenhum produto encontrado')).toBeInTheDocument();
    });

    test('botão Buscar envia termo, categoria e status para a API', async () => {
        API.get.mockResolvedValueOnce({ data: [produtoMock] });
        render(<ProdutosList onEdit={jest.fn()} refresh={false} />);
        await screen.findByText('ELT-001');

        API.get.mockResolvedValueOnce({ data: [produtoMock] });
        fireEvent.change(screen.getByPlaceholderText('Buscar por código ou nome...'), {
            target: { value: 'cabo' }
        });
        fireEvent.change(screen.getByDisplayValue('Todas as categorias'), {
            target: { value: 'Eletrônicos' }
        });
        fireEvent.change(screen.getByDisplayValue('Todos os status'), {
            target: { value: 'ATIVO' }
        });
        fireEvent.click(screen.getByRole('button', { name: 'Buscar' }));

        await waitFor(() =>
            expect(API.get).toHaveBeenLastCalledWith('/produtos', {
                params: { termo: 'cabo', categoria: 'Eletrônicos', status: 'ATIVO' }
            })
        );
    });

    test('clique em Editar chama onEdit com o produto', async () => {
        API.get.mockResolvedValueOnce({ data: [produtoMock] });
        const onEdit = jest.fn();
        render(<ProdutosList onEdit={onEdit} refresh={false} />);
        await screen.findByText('ELT-001');

        fireEvent.click(screen.getByRole('button', { name: 'Editar' }));

        expect(onEdit).toHaveBeenCalledWith(produtoMock);
    });

    test('excluir cancela quando usuário não confirma', async () => {
        window.confirm = jest.fn(() => false);
        API.get.mockResolvedValueOnce({ data: [produtoMock] });
        render(<ProdutosList onEdit={jest.fn()} refresh={false} />);
        await screen.findByText('ELT-001');

        fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

        expect(window.confirm).toHaveBeenCalled();
        expect(API.delete).not.toHaveBeenCalled();
    });

    test('excluir remove o produto quando usuário confirma', async () => {
        window.confirm = jest.fn(() => true);
        API.get.mockResolvedValueOnce({ data: [produtoMock] });
        API.delete.mockResolvedValueOnce({});
        API.get.mockResolvedValueOnce({ data: [] });

        render(<ProdutosList onEdit={jest.fn()} refresh={false} />);
        await screen.findByText('ELT-001');

        fireEvent.click(screen.getByRole('button', { name: 'Excluir' }));

        await waitFor(() => expect(API.delete).toHaveBeenCalledWith('/produtos/1'));
        expect(await screen.findByText('Nenhum produto encontrado')).toBeInTheDocument();
    });
});
