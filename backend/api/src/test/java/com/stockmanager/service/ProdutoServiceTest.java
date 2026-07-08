package com.stockmanager.service;

import com.stockmanager.dto.DashboardDTO;
import com.stockmanager.dto.ProdutoDTO;
import com.stockmanager.model.Produto;
import com.stockmanager.repository.ProdutoRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProdutoServiceTest {

    @Mock
    private ProdutoRepository produtoRepository;

    @InjectMocks
    private ProdutoService produtoService;

    private ProdutoDTO criarDTO() {
        ProdutoDTO dto = new ProdutoDTO();
        dto.setCodigo("ELT-999");
        dto.setNome("Produto Teste");
        dto.setDescricao("Descrição");
        dto.setCategoria("Eletrônicos");
        dto.setPrecoUnitario(new BigDecimal("19.90"));
        dto.setQuantidadeEstoque(10);
        dto.setStatus("ATIVO");
        return dto;
    }

    private Produto criarProduto(Long id, String codigo) {
        Produto produto = new Produto();
        produto.setId(id);
        produto.setCodigo(codigo);
        produto.setNome("Produto Existente");
        produto.setCategoria("Eletrônicos");
        produto.setPrecoUnitario(new BigDecimal("10.00"));
        produto.setQuantidadeEstoque(5);
        produto.setStatus("ATIVO");
        return produto;
    }

    @Test
    void create_quandoCodigoNaoExiste_deveSalvarProduto() {
        ProdutoDTO dto = criarDTO();
        when(produtoRepository.findByCodigo(dto.getCodigo())).thenReturn(Optional.empty());
        when(produtoRepository.save(any(Produto.class))).thenAnswer(inv -> inv.getArgument(0));

        Produto salvo = produtoService.create(dto);

        assertThat(salvo.getCodigo()).isEqualTo("ELT-999");
        assertThat(salvo.getNome()).isEqualTo("Produto Teste");
        verify(produtoRepository).save(any(Produto.class));
    }

    @Test
    void create_quandoCodigoJaExiste_deveLancarExcecao() {
        ProdutoDTO dto = criarDTO();
        when(produtoRepository.findByCodigo(dto.getCodigo()))
            .thenReturn(Optional.of(criarProduto(1L, dto.getCodigo())));

        assertThatThrownBy(() -> produtoService.create(dto))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Código já cadastrado");

        verify(produtoRepository, never()).save(any());
    }

    @Test
    void update_quandoProdutoNaoEncontrado_deveLancarExcecao() {
        when(produtoRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> produtoService.update(99L, criarDTO()))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Produto não encontrado");
    }

    @Test
    void update_quandoCodigoPertenceAOutroProduto_deveLancarExcecao() {
        Produto existente = criarProduto(1L, "ELT-001");
        Produto outroComCodigoNovo = criarProduto(2L, "ELT-999");
        ProdutoDTO dto = criarDTO();

        when(produtoRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(produtoRepository.findByCodigo(dto.getCodigo())).thenReturn(Optional.of(outroComCodigoNovo));

        assertThatThrownBy(() -> produtoService.update(1L, dto))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Código já cadastrado");
    }

    @Test
    void update_quandoValido_deveAtualizarCampos() {
        Produto existente = criarProduto(1L, "ELT-999");
        ProdutoDTO dto = criarDTO();

        when(produtoRepository.findById(1L)).thenReturn(Optional.of(existente));
        when(produtoRepository.findByCodigo(dto.getCodigo())).thenReturn(Optional.of(existente));
        when(produtoRepository.save(any(Produto.class))).thenAnswer(inv -> inv.getArgument(0));

        Produto atualizado = produtoService.update(1L, dto);

        assertThat(atualizado.getNome()).isEqualTo("Produto Teste");
        assertThat(atualizado.getPrecoUnitario()).isEqualByComparingTo("19.90");
    }

    @Test
    void delete_quandoNaoExiste_deveLancarExcecao() {
        when(produtoRepository.existsById(1L)).thenReturn(false);

        assertThatThrownBy(() -> produtoService.delete(1L))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Produto não encontrado");

        verify(produtoRepository, never()).deleteById(any());
    }

    @Test
    void delete_quandoExiste_deveDeletar() {
        when(produtoRepository.existsById(1L)).thenReturn(true);

        produtoService.delete(1L);

        verify(produtoRepository).deleteById(1L);
    }

    @Test
    void getDashboardData_deveIncluirTodasCategoriasFixasMesmoSemProdutos() {
        when(produtoRepository.count()).thenReturn(2L);
        when(produtoRepository.countAtivos()).thenReturn(1L);
        when(produtoRepository.countInativos()).thenReturn(1L);
        when(produtoRepository.countProdutosPorCategoria())
            .thenReturn(Collections.singletonList(new Object[]{"Eletrônicos", 2L}));
        when(produtoRepository.countAtivosPorCategoria())
            .thenReturn(Collections.singletonList(new Object[]{"Eletrônicos", 1L}));
        when(produtoRepository.findAll()).thenReturn(List.of());
        when(produtoRepository.findByStatus("INATIVO")).thenReturn(List.of(criarProduto(1L, "ELT-001")));

        DashboardDTO dashboard = produtoService.getDashboardData();

        assertThat(dashboard.getTotalProdutos()).isEqualTo(2);
        assertThat(dashboard.getPercentualAtivos()).isEqualTo(50.0);
        assertThat(dashboard.getProdutosPorCategoria()).containsKeys(
            "Eletrônicos", "Ferramentas", "Limpeza", "Escritório", "Informática"
        );
        assertThat(dashboard.getProdutosPorCategoria().get("Ferramentas")).isEqualTo(0L);
        assertThat(dashboard.getAtivosPorCategoria().get("Eletrônicos")).isEqualTo(1L);
        assertThat(dashboard.getProdutosInativosLista()).hasSize(1);
    }
}
