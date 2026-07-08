# StockManager Pro

[🇺🇸 Read in English](README.md)

Aplicação de gerenciamento de produtos (estoque) com autenticação, dashboard e CRUD completo.

**🔗 Demo ao vivo:** [stockmanager-pro.vercel.app](https://stockmanager-pro.vercel.app) — login com `admin@stock.com` / `admin123`
(backend hospedado na Railway; a primeira requisição pode demorar alguns segundos)

## Stack

- **Backend**: Java 17, Spring Boot 3.5, Spring Data JPA, Spring Security, MySQL 8
- **Frontend**: React 18, Axios
- **Banco de dados**: MySQL 8

## Pré-requisitos

- Java 17+
- Node.js 18+ e npm
- MySQL 8 rodando localmente
- Não é necessário instalar o Maven — o projeto já inclui o wrapper (`mvnw`)

## Configuração do banco de dados

1. Rode o script `script.sql` (na raiz do projeto) em um cliente MySQL. Ele cria o banco `stockmanager`, a tabela `produtos` e insere 5 produtos de exemplo (um por categoria).
2. Crie um usuário dedicado para a aplicação:

```sql
CREATE USER 'stockmanager'@'localhost' IDENTIFIED BY 'Stock@Manager123!';
GRANT ALL PRIVILEGES ON stockmanager.* TO 'stockmanager'@'localhost';
FLUSH PRIVILEGES;
```

Se preferir usar outro usuário/senha, sobrescreva via variáveis de ambiente `DB_USERNAME` e `DB_PASSWORD` — `application.properties` já está preparado para isso.

## Rodando o backend

```bash
cd backend/api
./mvnw spring-boot:run
```

Sobe em `http://localhost:8080`.

Rodar os testes automatizados:

```bash
./mvnw test
```

## Rodando o frontend

```bash
cd frontend
npm install
npm start
```

Abre em `http://localhost:3000`.

Rodar os testes automatizados:

```bash
npm test -- --watchAll=false
```

## Login

| Campo | Valor |
|---|---|
| Email | `admin@stock.com` |
| Senha | `admin123` |

> Credenciais de demonstração, criadas pelo `script.sql` — use apenas em ambiente local.

## Telas

1. **Login** — autenticação por email/senha contra o backend.
2. **Dashboard** — total de produtos, ativos/inativos com percentual, produtos por categoria (tabela), ativos por categoria (lista) e lista de produtos inativos.
3. **Produtos** — listagem com busca por texto, filtro por categoria/status, edição e exclusão.
4. **Cadastro de produto** — formulário com nome, código, descrição, categoria, status, preço unitário e quantidade em estoque.

## API

Base URL: `http://localhost:8080/api`. Todos os endpoints (exceto login) exigem HTTP Basic Auth.

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Autentica `{ "email", "senha" }` |
| GET | `/produtos` | Lista produtos; aceita `termo`, `categoria`, `status` (opcionais e combináveis) |
| GET | `/produtos/{id}` | Busca produto por ID |
| GET | `/produtos/codigo/{codigo}` | Busca produto por código |
| POST | `/produtos` | Cria produto |
| PUT | `/produtos/{id}` | Atualiza produto |
| DELETE | `/produtos/{id}` | Remove produto |
| GET | `/produtos/dashboard` | Métricas do dashboard |
| GET | `/produtos/categorias` | Lista as 5 categorias fixas |

Uma collection pronta para o **Insomnia** está em `insomnia_stockmanager.json` (raiz do projeto) — basta importar.

## Estrutura do projeto

```
backend/api/src/main/java/com/stockmanager/
├── config/         # SecurityConfig (auth, CORS)
├── controller/      # AuthController, ProdutoController
├── dto/             # ProdutoDTO, DashboardDTO
├── exception/       # GlobalExceptionHandler
├── model/           # Produto (entidade JPA)
├── repository/      # ProdutoRepository
└── service/         # ProdutoService (regras de negócio)

frontend/src/
├── api/             # cliente axios
└── components/      # Login, Dashboard, ProdutosList, ProdutoForm, Navbar
```

## Licença

Distribuído sob a licença MIT. Veja [LICENSE](LICENSE).
