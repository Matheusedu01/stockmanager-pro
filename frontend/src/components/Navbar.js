import React from 'react';
import './Navbar.css';

function Navbar({ currentPage, onPageChange, onLogout, onNewProduct }) {
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <span className="brand-name">StockManager Pro</span>
            </div>
            
            <div className="navbar-menu">
                <button 
                    className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
                    onClick={() => onPageChange('dashboard')}
                >
                    Dashboard
                </button>
                <button 
                    className={`nav-item ${currentPage === 'produtos' ? 'active' : ''}`}
                    onClick={() => onPageChange('produtos')}
                >
                    Produtos
                </button>
            </div>

            <div className="navbar-actions">
                <button className="btn-new" onClick={onNewProduct}>
                    + Novo Produto
                </button>
                <button className="btn-logout" onClick={onLogout}>
                    Sair
                </button>
            </div>
        </nav>
    );
}

export default Navbar;