package com.stockmanager.service;

import com.stockmanager.dto.DashboardDTO;
import com.stockmanager.dto.ProdutoDTO;
import com.stockmanager.model.Produto;
import com.stockmanager.repository.ProdutoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProdutoService {

    public static final List<String> CATEGORIAS = List.of(
        "Eletrônicos", "Ferramentas", "Limpeza", "Escritório", "Informática"
    );

    @Autowired
    private ProdutoRepository produtoRepository;

    public List<Produto> findAll() {
        return produtoRepository.findAll();
    }

    public Optional<Produto> findById(Long id) {
        return produtoRepository.findById(id);
    }

    public Optional<Produto> findByCodigo(String codigo) {
        return produtoRepository.findByCodigo(codigo);
    }

    @Transactional
    public Produto create(ProdutoDTO produtoDTO) {
        // Verificar se código já existe
        if (produtoRepository.findByCodigo(produtoDTO.getCodigo()).isPresent()) {
            throw new RuntimeException("Código já cadastrado: " + produtoDTO.getCodigo());
        }

        Produto produto = new Produto();
        produto.setCodigo(produtoDTO.getCodigo());
        produto.setNome(produtoDTO.getNome());
        produto.setDescricao(produtoDTO.getDescricao());
        produto.setCategoria(produtoDTO.getCategoria());
        produto.setPrecoUnitario(produtoDTO.getPrecoUnitario());
        produto.setQuantidadeEstoque(produtoDTO.getQuantidadeEstoque());
        produto.setStatus(produtoDTO.getStatus());

        return produtoRepository.save(produto);
    }

    @Transactional
    public Produto update(Long id, ProdutoDTO produtoDTO) {
        Produto produto = produtoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Produto não encontrado com ID: " + id));

        // Verificar se código já existe (para outro produto)
        Optional<Produto> existing = produtoRepository.findByCodigo(produtoDTO.getCodigo());
        if (existing.isPresent() && !existing.get().getId().equals(id)) {
            throw new RuntimeException("Código já cadastrado: " + produtoDTO.getCodigo());
        }

        produto.setCodigo(produtoDTO.getCodigo());
        produto.setNome(produtoDTO.getNome());
        produto.setDescricao(produtoDTO.getDescricao());
        produto.setCategoria(produtoDTO.getCategoria());
        produto.setPrecoUnitario(produtoDTO.getPrecoUnitario());
        produto.setQuantidadeEstoque(produtoDTO.getQuantidadeEstoque());
        produto.setStatus(produtoDTO.getStatus());

        return produtoRepository.save(produto);
    }

    @Transactional
    public void delete(Long id) {
        if (!produtoRepository.existsById(id)) {
            throw new RuntimeException("Produto não encontrado com ID: " + id);
        }
        produtoRepository.deleteById(id);
    }

    public List<Produto> buscar(String termo, String categoria, String status) {
        return produtoRepository.buscar(
            termo == null ? "" : termo.trim(),
            categoria == null ? "" : categoria.trim(),
            status == null ? "" : status.trim()
        );
    }

    public DashboardDTO getDashboardData() {
        long total = produtoRepository.count();
        long ativos = produtoRepository.countAtivos();
        long inativos = produtoRepository.countInativos();
        
        double percentualAtivos = total > 0 ? (ativos * 100.0 / total) : 0;
        double percentualInativos = total > 0 ? (inativos * 100.0 / total) : 0;

        // Produtos por categoria (garante todas as categorias fixas, mesmo com 0)
        Map<String, Long> produtosPorCategoria = new LinkedHashMap<>();
        CATEGORIAS.forEach(cat -> produtosPorCategoria.put(cat, 0L));
        for (Object[] row : produtoRepository.countProdutosPorCategoria()) {
            produtosPorCategoria.put((String) row[0], (Long) row[1]);
        }

        // Ativos por categoria (garante todas as categorias fixas, mesmo com 0)
        Map<String, Long> ativosPorCategoria = new LinkedHashMap<>();
        CATEGORIAS.forEach(cat -> ativosPorCategoria.put(cat, 0L));
        for (Object[] row : produtoRepository.countAtivosPorCategoria()) {
            ativosPorCategoria.put((String) row[0], (Long) row[1]);
        }

        // Calcular novos produtos este mês
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0);
        long novosMes = produtoRepository.findAll().stream()
            .filter(p -> p.getDataCriacao() != null && p.getDataCriacao().isAfter(startOfMonth))
            .count();

        List<Produto> produtosInativos = produtoRepository.findByStatus("INATIVO");

        DashboardDTO dashboard = new DashboardDTO();
        dashboard.setTotalProdutos(total);
        dashboard.setProdutosAtivos(ativos);
        dashboard.setProdutosInativos(inativos);
        dashboard.setPercentualAtivos(percentualAtivos);
        dashboard.setPercentualInativos(percentualInativos);
        dashboard.setNovosMes(novosMes);
        dashboard.setProdutosPorCategoria(produtosPorCategoria);
        dashboard.setAtivosPorCategoria(ativosPorCategoria);
        dashboard.setProdutosInativosLista(produtosInativos);

        return dashboard;
    }
}