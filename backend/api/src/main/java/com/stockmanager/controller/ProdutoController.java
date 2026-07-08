package com.stockmanager.controller;

import com.stockmanager.dto.DashboardDTO;
import com.stockmanager.dto.ProdutoDTO;
import com.stockmanager.model.Produto;
import com.stockmanager.service.ProdutoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    @Autowired
    private ProdutoService produtoService;

    @GetMapping
    public ResponseEntity<List<Produto>> getAll(
            @RequestParam(required = false) String termo,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(produtoService.buscar(termo, categoria, status));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produto> getById(@PathVariable Long id) {
        return produtoService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<Produto> getByCodigo(@PathVariable String codigo) {
        return produtoService.findByCodigo(codigo)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Produto> create(@Valid @RequestBody ProdutoDTO produtoDTO) {
        Produto produto = produtoService.create(produtoDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(produto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produto> update(@PathVariable Long id, @Valid @RequestBody ProdutoDTO produtoDTO) {
        Produto produto = produtoService.update(id, produtoDTO);
        return ResponseEntity.ok(produto);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        produtoService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardDTO> getDashboard() {
        return ResponseEntity.ok(produtoService.getDashboardData());
    }

    @GetMapping("/categorias")
    public ResponseEntity<List<String>> getCategorias() {
        return ResponseEntity.ok(ProdutoService.CATEGORIAS);
    }
}