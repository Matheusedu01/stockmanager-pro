import React, { useState, useEffect, useCallback } from 'react';
import API from '../api/api';
import './ProdutosList.css';

const CATEGORIAS = ['Eletrônicos', 'Ferramentas', 'Limpeza', 'Escritório', 'Informática'];
const ITEMS_PER_PAGE = 5;

function ProdutosList({ onEdit, onNewProduct, refresh }) {
    const [produtos, setProdutos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);

    const [termo, setTermo] = useState('');
    const [categoria, setCategoria] = useState('');
    const [status, setStatus] = useState('');

    const fetchProdutos = useCallback(async (params) => {
        setLoading(true);
        setError('');
        try {
            const response = await API.get('/produtos', { params });
            setProdutos(response.data);
            setPage(1);
        } catch (err) {
            setError('Erro ao carregar produtos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProdutos({});
    }, [fetchProdutos, refresh]);

    const handleSearch = () => {
        fetchProdutos({ termo, categoria, status });
    };

    const handleClear = () => {
        setTermo('');
        setCategoria('');
        setStatus('');
        fetchProdutos({});
    };

    const handleDelete = async (produto) => {
        if (!window.confirm(`Tem certeza que deseja excluir o produto "${produto.nome}"?`)) {
            return;
        }
        try {
            await API.delete(`/produtos/${produto.id}`);
            fetchProdutos({ termo, categoria, status });
        } catch (err) {
            alert(err.response?.data?.error || 'Erro ao excluir produto');
        }
    };

    const totalPages = Math.max(1, Math.ceil(produtos.length / ITEMS_PER_PAGE));
    const paginated = produtos.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    const formatPreco = (valor) =>
        Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="produtos-list">
            <div className="list-header">
                <h2>Produtos</h2>
                {onNewProduct && (
                    <button className="btn-new-product" onClick={onNewProduct}>
                        + Novo Produto
                    </button>
                )}
            </div>

            <div className="filters">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Buscar por código ou nome..."
                        value={termo}
                        onChange={(e) => setTermo(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="btn-search" onClick={handleSearch}>Buscar</button>
                </div>
                <div className="filter-box">
                    <select value={categoria} onChange={(e) => setCategoria(e.target.value)}>
                        <option value="">Todas as categorias</option>
                        {CATEGORIAS.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">Todos os status</option>
                        <option value="ATIVO">Ativo</option>
                        <option value="INATIVO">Inativo</option>
                    </select>
                    <button className="btn-clear" onClick={handleClear}>Limpar filtros</button>
                </div>
            </div>

            {loading && <div className="loading">Carregando...</div>}
            {!loading && error && <div className="error">{error}</div>}

            {!loading && !error && (
                <>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Código</th>
                                    <th>Nome</th>
                                    <th>Categoria</th>
                                    <th>Preço Unit.</th>
                                    <th>Qtd. Estoque</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((produto) => (
                                    <tr key={produto.id}>
                                        <td className="codigo">{produto.codigo}</td>
                                        <td className="nome">{produto.nome}</td>
                                        <td>{produto.categoria}</td>
                                        <td className="preco">{formatPreco(produto.precoUnitario)}</td>
                                        <td className="quantidade">{produto.quantidadeEstoque}</td>
                                        <td>
                                            <span className={`badge ${produto.status === 'ATIVO' ? 'active' : 'inactive'}`}>
                                                {produto.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                                            </span>
                                        </td>
                                        <td className="acoes">
                                            <button className="btn-edit" onClick={() => onEdit(produto)}>Editar</button>
                                            <button className="btn-delete" onClick={() => handleDelete(produto)}>Excluir</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {produtos.length === 0 && (
                            <div className="no-data">Nenhum produto encontrado</div>
                        )}
                    </div>

                    {produtos.length > 0 && (
                        <div className="pagination">
                            <button
                                className="pagination-btn"
                                disabled={page === 1}
                                onClick={() => setPage((p) => p - 1)}
                            >
                                Anterior
                            </button>
                            <span className="pagination-info">Página {page} de {totalPages}</span>
                            <button
                                className="pagination-btn"
                                disabled={page === totalPages}
                                onClick={() => setPage((p) => p + 1)}
                            >
                                Próxima
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default ProdutosList;
