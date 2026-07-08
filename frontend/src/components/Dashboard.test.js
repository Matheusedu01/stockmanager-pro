import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';
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

const dashboardMock = {
    totalProdutos: 5,
    produtosAtivos: 4,
    produtosInativos: 1,
    percentualAtivos: 80,
    percentualInativos: 20,
    novosMes: 5,
    produtosPorCategoria: {
        'Eletrônicos': 1,
        'Ferramentas': 1,
        'Limpeza': 1,
        'Escritório': 1,
        'Informática': 1
    },
    ativosPorCategoria: {
        'Eletrônicos': 1,
        'Ferramentas': 1,
        'Limpeza': 1,
        'Escritório': 1,
        'Informática': 0
    },
    produtosInativosLista: [
        {
            id: 4,
            codigo: 'INF-009',
            nome: 'Mouse sem fio',
            categoria: 'Informática',
            precoUnitario: 89.9,
            quantidadeEstoque: 5,
            status: 'INATIVO'
        }
    ]
};

describe('Dashboard', () => {
    afterEach(() => jest.clearAllMocks());

    test('exibe totais e percentuais após carregar', async () => {
        API.get.mockResolvedValueOnce({ data: dashboardMock });
        render(<Dashboard />);

        expect(screen.getByText('Carregando...')).toBeInTheDocument();

        expect(await screen.findByText('5', { selector: '.stat-value' })).toBeInTheDocument();
        expect(screen.getByText('4', { selector: '.stat-value' })).toBeInTheDocument();
        expect(screen.getByText('80.0% do total')).toBeInTheDocument();
        expect(screen.getByText('20.0% do total')).toBeInTheDocument();
    });

    test('exibe tabela de produtos por categoria com todas as 5 categorias', async () => {
        API.get.mockResolvedValueOnce({ data: dashboardMock });
        render(<Dashboard />);

        await screen.findByText('Produtos por Categoria');
        ['Eletrônicos', 'Ferramentas', 'Limpeza', 'Escritório', 'Informática'].forEach((categoria) => {
            expect(screen.getAllByText(categoria).length).toBeGreaterThan(0);
        });
    });

    test('exibe lista de produtos inativos com a contagem correta', async () => {
        API.get.mockResolvedValueOnce({ data: dashboardMock });
        render(<Dashboard />);

        expect(await screen.findByText('Produtos Inativos (1)')).toBeInTheDocument();
        expect(screen.getByText('INF-009')).toBeInTheDocument();
        expect(screen.getByText('Mouse sem fio')).toBeInTheDocument();
    });

    test('exibe mensagem quando não há produtos inativos', async () => {
        API.get.mockResolvedValueOnce({
            data: { ...dashboardMock, produtosInativos: 0, produtosInativosLista: [] }
        });
        render(<Dashboard />);

        expect(await screen.findByText('Nenhum produto inativo')).toBeInTheDocument();
    });

    test('exibe mensagem de erro quando a requisição falha', async () => {
        API.get.mockRejectedValueOnce(new Error('network error'));
        render(<Dashboard />);

        expect(await screen.findByText('Erro ao carregar dados do dashboard')).toBeInTheDocument();
    });
});
