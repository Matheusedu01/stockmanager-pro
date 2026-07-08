package com.stockmanager.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "produtos", uniqueConstraints = {
    @UniqueConstraint(columnNames = "codigo")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Código é obrigatório")
    @Column(unique = true, length = 20)
    private String codigo;

    @NotBlank(message = "Nome é obrigatório")
    @Column(length = 100)
    private String nome;

    @Column(length = 500)
    private String descricao;

    @NotBlank(message = "Categoria é obrigatória")
    @Column(length = 50)
    private String categoria;

    @NotNull(message = "Preço unitário é obrigatório")
    @Positive(message = "Preço deve ser maior que zero")
    @Column(precision = 10, scale = 2)
    private BigDecimal precoUnitario;

    @NotNull(message = "Quantidade em estoque é obrigatória")
    @PositiveOrZero(message = "Quantidade deve ser maior ou igual a zero")
    @Column(name = "quantidade_estoque")
    private Integer quantidadeEstoque;

    @NotBlank(message = "Status é obrigatório")
    @Pattern(regexp = "ATIVO|INATIVO", message = "Status deve ser ATIVO ou INATIVO")
    @Column(length = 10)
    private String status; // ATIVO ou INATIVO

    @Column(name = "data_criacao")
    private java.time.LocalDateTime dataCriacao;

    @Column(name = "data_atualizacao")
    private java.time.LocalDateTime dataAtualizacao;

    @PrePersist
    protected void onCreate() {
        dataCriacao = java.time.LocalDateTime.now();
        dataAtualizacao = java.time.LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        dataAtualizacao = java.time.LocalDateTime.now();
    }
}