import React, { useState, useEffect } from 'react';
import API from '../api/api';
import './Dashboard.css';

function Dashboard() {
    const [dashboardData, setDashboardData] = useState({
        totalProdutos: 0,
        produtosAtivos: 0,
        produtosInativos: 0,
        percentualAtivos: 0,
        percentualInativos: 0,
        novosMes: 0,
        produtosPorCategoria: {},
        ativosPorCategoria: {},
        produtosInativosLista: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const response = await API.get('/produtos/dashboard');
            setDashboardData(response.data);
            setLoading(false);
        } catch (err) {
            setError('Erro ao carregar dados do dashboard');
            setLoading(false);
            console.error(err);
        }
    };

    if (loading) return <div className="loading">Carregando...</div>;
    if (error) return <div className="error">{error}</div>;

    const {
        totalProdutos,
        produtosAtivos,
        produtosInativos,
        percentualAtivos,
        percentualInativos,
        novosMes,
        produtosPorCategoria,
        ativosPorCategoria,
        produtosInativosLista
    } = dashboardData;

    const formatPreco = (valor) =>
        Number(valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="dashboard">
            <h1>Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Total de Produtos</span>
                        <span className="stat-value">{totalProdutos}</span>
                        <span className="stat-change positive">+{novosMes} este mês</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Produtos Ativos</span>
                        <span className="stat-value">{produtosAtivos}</span>
                        <span className="stat-percent">{percentualAtivos.toFixed(1)}% do total</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-info">
                        <span className="stat-label">Produtos Inativos</span>
                        <span className="stat-value">{produtosInativos}</span>
                        <span className="stat-percent negative">{percentualInativos.toFixed(1)}% do total</span>
                    </div>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-card">
                    <h3>Produtos por Categoria</h3>
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Categoria</th>
                                <th>Qtd. Produtos</th>
                                <th>% do total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(produtosPorCategoria).map(([categoria, total]) => (
                                <tr key={categoria}>
                                    <td>{categoria}</td>
                                    <td>{total}</td>
                                    <td>{totalProdutos > 0 ? ((total / totalProdutos) * 100).toFixed(1) : '0.0'}%</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="chart-card">
                    <h3>Ativos por Categoria</h3>
                    {Object.entries(ativosPorCategoria).map(([categoria, total]) => (
                        <div key={categoria} className="chart-bar">
                            <span className="chart-label">{categoria}</span>
                            <div className="chart-bar-track">
                                <div
                                    className="chart-bar-fill active"
                                    style={{ width: `${produtosAtivos > 0 ? (total / produtosAtivos) * 100 : 0}%` }}
                                ></div>
                            </div>
                            <span className="chart-value">{total}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="chart-card inactive-card">
                <h3>Produtos Inativos ({produtosInativosLista.length})</h3>
                {produtosInativosLista.length === 0 ? (
                    <div className="no-data">Nenhum produto inativo</div>
                ) : (
                    <table className="dash-table">
                        <thead>
                            <tr>
                                <th>Código</th>
                                <th>Nome</th>
                                <th>Categoria</th>
                                <th>Preço Unit.</th>
                                <th>Qtd. Estoque</th>
                            </tr>
                        </thead>
                        <tbody>
                            {produtosInativosLista.map((produto) => (
                                <tr key={produto.id}>
                                    <td className="codigo">{produto.codigo}</td>
                                    <td>{produto.nome}</td>
                                    <td>{produto.categoria}</td>
                                    <td>{formatPreco(produto.precoUnitario)}</td>
                                    <td>{produto.quantidadeEstoque}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Dashboard;