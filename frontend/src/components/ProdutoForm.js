import React, { useState, useEffect } from 'react';
import API from '../api/api';
import './ProdutoForm.css';

function ProdutoForm({ produto, onSuccess, onCancel }) {
    const [formData, setFormData] = useState({
        codigo: '',
        nome: '',
        descricao: '',
        categoria: '',
        precoUnitario: '',
        quantidadeEstoque: '',
        status: 'ATIVO'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const categorias = ['Eletrônicos', 'Ferramentas', 'Limpeza', 'Escritório', 'Informática'];

    useEffect(() => {
        if (produto) {
            setFormData({
                codigo: produto.codigo || '',
                nome: produto.nome || '',
                descricao: produto.descricao || '',
                categoria: produto.categoria || '',
                precoUnitario: produto.precoUnitario || '',
                quantidadeEstoque: produto.quantidadeEstoque || '',
                status: produto.status || 'ATIVO'
            });
        }
    }, [produto]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
        setSuccess('');
    };

    const validate = () => {
        if (!formData.codigo.trim()) return 'Código é obrigatório';
        if (!formData.nome.trim()) return 'Nome é obrigatório';
        if (!formData.categoria) return 'Categoria é obrigatória';
        if (!formData.precoUnitario || parseFloat(formData.precoUnitario) <= 0) {
            return 'Preço unitário deve ser maior que zero';
        }
        if (!formData.quantidadeEstoque || parseInt(formData.quantidadeEstoque) < 0) {
            return 'Quantidade em estoque deve ser maior ou igual a zero';
        }
        if (!formData.status) return 'Status é obrigatório';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const validationError = validate();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const dataToSend = {
                ...formData,
                precoUnitario: parseFloat(formData.precoUnitario),
                quantidadeEstoque: parseInt(formData.quantidadeEstoque)
            };

            if (produto) {
                await API.put(`/produtos/${produto.id}`, dataToSend);
                setSuccess('Produto atualizado com sucesso!');
            } else {
                await API.post('/produtos', dataToSend);
                setSuccess('Produto cadastrado com sucesso!');
            }

            setTimeout(() => onSuccess(), 1500);
        } catch (err) {
            console.error('Erro ao salvar produto:', err);
            if (err.response?.data?.error) {
                setError(err.response.data.error);
            } else {
                setError('Erro ao salvar produto. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="produto-form-container">
            <div className="form-card">
                <div className="form-header">
                    <h2>{produto ? 'Editar Produto' : 'Novo Produto'}</h2>
                    <button className="btn-close" onClick={onCancel}>×</button>
                </div>

                <form onSubmit={handleSubmit}>
                    {error && <div className="alert error">{error}</div>}
                    {success && <div className="alert success">{success}</div>}

                    <div className="form-section">
                        <h3>Identificação</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Código *</label>
                                <input
                                    type="text"
                                    name="codigo"
                                    value={formData.codigo}
                                    onChange={handleChange}
                                    placeholder="Ex: ELT-001"
                                    disabled={!!produto}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nome do Produto *</label>
                                <input
                                    type="text"
                                    name="nome"
                                    value={formData.nome}
                                    onChange={handleChange}
                                    placeholder="Nome do produto"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Descrição</label>
                            <textarea
                                name="descricao"
                                value={formData.descricao}
                                onChange={handleChange}
                                placeholder="Descrição do produto"
                                rows="3"
                            />
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Classificação</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Categoria *</label>
                                <select
                                    name="categoria"
                                    value={formData.categoria}
                                    onChange={handleChange}
                                >
                                    <option value="">Selecione uma categoria</option>
                                    {categorias.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Status *</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                >
                                    <option value="ATIVO">Ativo</option>
                                    <option value="INATIVO">Inativo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h3>Preço e Estoque</h3>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Preço Unitário (R$) *</label>
                                <input
                                    type="number"
                                    name="precoUnitario"
                                    value={formData.precoUnitario}
                                    onChange={handleChange}
                                    placeholder="29.90"
                                    step="0.01"
                                    min="0.01"
                                />
                            </div>
                            <div className="form-group">
                                <label>Quantidade em Estoque *</label>
                                <input
                                    type="number"
                                    name="quantidadeEstoque"
                                    value={formData.quantidadeEstoque}
                                    onChange={handleChange}
                                    placeholder="0"
                                    step="1"
                                    min="0"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-cancel" onClick={onCancel}>
                            Cancelar
                        </button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Salvando...' : (produto ? 'Atualizar' : 'Cadastrar')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProdutoForm;