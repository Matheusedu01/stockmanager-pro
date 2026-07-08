package com.stockmanager.dto;

import com.stockmanager.model.Produto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private long totalProdutos;
    private long produtosAtivos;
    private long produtosInativos;
    private double percentualAtivos;
    private double percentualInativos;
    private long novosMes;
    private Map<String, Long> produtosPorCategoria;
    private Map<String, Long> ativosPorCategoria;
    private List<Produto> produtosInativosLista;
}