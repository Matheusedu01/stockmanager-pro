import React, { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProdutosList from './components/ProdutosList';
import ProdutoForm from './components/ProdutoForm';
import Navbar from './components/Navbar';
import { setAuthCredentials, clearAuthCredentials } from './api/api';
import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [editingProduct, setEditingProduct] = useState(null);
    const [refreshList, setRefreshList] = useState(false);

    const handleLogin = (status, email, senha) => {
        if (status) {
            setAuthCredentials(email, senha);
            setCurrentPage('dashboard');
        }
        setIsAuthenticated(status);
    };

    const handleLogout = () => {
        clearAuthCredentials();
        setIsAuthenticated(false);
    };

    const handleEdit = (produto) => {
        setEditingProduct(produto);
        setCurrentPage('form');
    };

    const handleNewProduct = () => {
        setEditingProduct(null);
        setCurrentPage('form');
    };

    const handleFormSuccess = () => {
        setEditingProduct(null);
        setRefreshList(!refreshList);
        setCurrentPage('produtos');
    };

    const renderPage = () => {
        switch (currentPage) {
            case 'dashboard':
                return <Dashboard />;
            case 'produtos':
                return <ProdutosList onEdit={handleEdit} onNewProduct={handleNewProduct} refresh={refreshList} />;
            case 'form':
                return (
                    <ProdutoForm 
                        produto={editingProduct}
                        onSuccess={handleFormSuccess}
                        onCancel={() => {
                            setEditingProduct(null);
                            setCurrentPage('produtos');
                        }}
                    />
                );
            default:
                return <Dashboard />;
        }
    };

    if (!isAuthenticated) {
        return <Login onLogin={handleLogin} />;
    }

    return (
        <div className="App">
            <Navbar 
                currentPage={currentPage} 
                onPageChange={setCurrentPage}
                onLogout={handleLogout}
                onNewProduct={handleNewProduct}
            />
            <main className="main-content">
                {renderPage()}
            </main>
        </div>
    );
}

export default App;