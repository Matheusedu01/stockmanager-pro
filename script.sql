-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS stockmanager;
USE stockmanager;

-- Criação da tabela produtos (colunas alinhadas com a entidade JPA Produto)
CREATE TABLE IF NOT EXISTS produtos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    nome VARCHAR(100) NOT NULL,
    descricao VARCHAR(500),
    categoria VARCHAR(50) NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT 'ATIVO',
    preco_unitario DECIMAL(10,2) NOT NULL,
    quantidade_estoque INT NOT NULL DEFAULT 0,
    data_criacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Dados de exemplo (5 produtos, um por categoria)
INSERT INTO produtos (codigo, nome, descricao, categoria, status, preco_unitario, quantidade_estoque) VALUES
('ELT-001', 'Cabo USB-C 2m', 'Cabo USB-C para carregamento e transferência', 'Eletrônicos', 'ATIVO', 29.90, 2),
('ESC-014', 'Resma A4 500 folhas', 'Papel A4 75g/m², 500 folhas', 'Escritório', 'ATIVO', 22.50, 1),
('FER-007', 'Chave de fenda Ph2', 'Chave de fenda Phillips tamanho 2', 'Ferramentas', 'ATIVO', 14.90, 47),
('INF-009', 'Mouse sem fio', 'Mouse óptico sem fio, preto', 'Informática', 'INATIVO', 89.90, 5),
('LMP-003', 'Detergente 500ml', 'Detergente líquido neutro 500ml', 'Limpeza', 'ATIVO', 4.75, 120);
