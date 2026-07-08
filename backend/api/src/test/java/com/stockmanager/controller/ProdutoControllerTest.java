package com.stockmanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stockmanager.dto.ProdutoDTO;
import com.stockmanager.model.Produto;
import com.stockmanager.service.ProdutoService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProdutoController.class)
@AutoConfigureMockMvc(addFilters = false)
class ProdutoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProdutoService produtoService;

    private Produto criarProduto() {
        Produto produto = new Produto();
        produto.setId(1L);
        produto.setCodigo("ELT-001");
        produto.setNome("Cabo USB-C 2m");
        produto.setCategoria("Eletrônicos");
        produto.setPrecoUnitario(new BigDecimal("29.90"));
        produto.setQuantidadeEstoque(2);
        produto.setStatus("ATIVO");
        return produto;
    }

    @Test
    void getAll_deveRetornarListaDeProdutos() throws Exception {
        when(produtoService.buscar(null, null, null)).thenReturn(List.of(criarProduto()));

        mockMvc.perform(get("/api/produtos"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].codigo").value("ELT-001"))
            .andExpect(jsonPath("$[0].nome").value("Cabo USB-C 2m"));
    }

    @Test
    void create_comDadosValidos_deveRetornar201() throws Exception {
        ProdutoDTO dto = new ProdutoDTO();
        dto.setCodigo("ELT-999");
        dto.setNome("Produto Novo");
        dto.setCategoria("Eletrônicos");
        dto.setPrecoUnitario(new BigDecimal("10.00"));
        dto.setQuantidadeEstoque(5);
        dto.setStatus("ATIVO");

        when(produtoService.create(any(ProdutoDTO.class))).thenReturn(criarProduto());

        mockMvc.perform(post("/api/produtos")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isCreated());
    }

    @Test
    void create_semNome_deveRetornar400ComMensagemDeErro() throws Exception {
        ProdutoDTO dto = new ProdutoDTO();
        dto.setCodigo("ELT-999");
        dto.setCategoria("Eletrônicos");
        dto.setPrecoUnitario(new BigDecimal("10.00"));
        dto.setQuantidadeEstoque(5);
        dto.setStatus("ATIVO");
        // nome propositalmente omitido

        mockMvc.perform(post("/api/produtos")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").exists());

        verify(produtoService, never()).create(any());
    }

    @Test
    void create_quandoCodigoDuplicado_deveRetornar400ComMensagemDoService() throws Exception {
        ProdutoDTO dto = new ProdutoDTO();
        dto.setCodigo("ELT-001");
        dto.setNome("Duplicado");
        dto.setCategoria("Eletrônicos");
        dto.setPrecoUnitario(new BigDecimal("10.00"));
        dto.setQuantidadeEstoque(5);
        dto.setStatus("ATIVO");

        when(produtoService.create(any(ProdutoDTO.class)))
            .thenThrow(new RuntimeException("Código já cadastrado: ELT-001"));

        mockMvc.perform(post("/api/produtos")
                .contentType("application/json")
                .content(objectMapper.writeValueAsString(dto)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("Código já cadastrado: ELT-001"));
    }

    @Test
    void delete_deveRetornar204() throws Exception {
        doNothing().when(produtoService).delete(1L);

        mockMvc.perform(delete("/api/produtos/1"))
            .andExpect(status().isNoContent());

        verify(produtoService).delete(1L);
    }

    @Test
    void getById_quandoNaoEncontrado_deveRetornar404() throws Exception {
        when(produtoService.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/produtos/99"))
            .andExpect(status().isNotFound());
    }

    @Test
    void getCategorias_deveRetornarCategoriasFixas() throws Exception {
        mockMvc.perform(get("/api/produtos/categorias"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.length()").value(5))
            .andExpect(jsonPath("$[0]").value("Eletrônicos"));
    }
}
