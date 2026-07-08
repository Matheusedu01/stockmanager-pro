package com.stockmanager.repository;

import com.stockmanager.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    
    Optional<Produto> findByCodigo(String codigo);

    List<Produto> findByStatus(String status);

    @Query("SELECT p FROM Produto p WHERE " +
           "(:termo IS NULL OR :termo = '' OR " +
           " LOWER(p.nome) LIKE LOWER(CONCAT('%', :termo, '%')) OR " +
           " LOWER(p.codigo) LIKE LOWER(CONCAT('%', :termo, '%'))) AND " +
           "(:categoria IS NULL OR :categoria = '' OR p.categoria = :categoria) AND " +
           "(:status IS NULL OR :status = '' OR p.status = :status) " +
           "ORDER BY p.nome")
    List<Produto> buscar(@Param("termo") String termo,
                          @Param("categoria") String categoria,
                          @Param("status") String status);
    
    @Query("SELECT COUNT(p) FROM Produto p WHERE p.status = 'ATIVO'")
    long countAtivos();
    
    @Query("SELECT COUNT(p) FROM Produto p WHERE p.status = 'INATIVO'")
    long countInativos();
    
    @Query("SELECT p.categoria, COUNT(p) FROM Produto p GROUP BY p.categoria ORDER BY COUNT(p) DESC")
    List<Object[]> countProdutosPorCategoria();
    
    @Query("SELECT p.categoria, COUNT(p) FROM Produto p WHERE p.status = 'ATIVO' GROUP BY p.categoria ORDER BY COUNT(p) DESC")
    List<Object[]> countAtivosPorCategoria();
}