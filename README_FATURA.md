# Componente Fatura - Emissor de Faturas

## Descrição
Componente Angular que transforma o arquivo HTML estático `fatura de serviços.html` em um componente completo e funcional. Mantém todas as características originais da fatura, incluindo:

## Funcionalidades

### 📋 Características Principais
- **Fatura de Serviços e Orçamentos**: Alternância entre tipos de documento
- **Geração automática de números**: Sistema automático de numeração de faturas
- **PIX integrado**: Geração de QR Code PIX com payload EMV correto
- **Consulta de CNPJ**: Integração com API da Receita Federal
- **Impressão otimizada**: Estilos específicos para impressão
- **Exportação JSON**: Salvamento e carregamento de dados

### 🎨 Interface
- **Design responsivo**: Layout adaptável para diferentes tamanhos de tela
- **Tema profissional**: Cores e gradientes modernos
- **Logo da empresa**: SVG customizado da Omni Inovações
- **Campos editáveis**: Todos os campos são editáveis e salvos em tempo real

### 💳 Sistema PIX
- **Detecção automática**: Reconhece tipo de chave PIX (CNPJ, CPF, email, telefone, aleatória)
- **QR Code dinâmico**: Geração em tempo real com valor atualizado
- **Fallback robusto**: Sistema de fallback para exibição quando APIs falham
- **Payload EMV**: Implementação correta do padrão PIX brasileiro

### 📊 Gestão de Serviços
- **Adicionar/Remover**: Gestão dinâmica de linhas de serviços
- **Cálculo automático**: Total calculado automaticamente
- **Validação**: Validação de campos numéricos
- **Períodos**: Campo específico para períodos de prestação de serviços

## Estrutura do Componente

### Arquivos
```
src/app/paginas/fatura/
├── fatura.component.ts      # Lógica principal do componente
├── fatura.component.html    # Template HTML
├── fatura.component.scss    # Estilos SCSS
└── fatura.component.spec.ts # Testes unitários
```

### Interfaces TypeScript
```typescript
interface Cliente {
  nome: string;
  cnpj: string;
  im: string;
  endereco: string;
  bairro: string;
  cep: string;
  cidade: string;
  uf: string;
  email: string;
}

interface Servico {
  descricao: string;
  periodo: string;
  valor: string;
}

interface Pagamento {
  banco: string;
  agencia: string;
  conta: string;
  pixChave: string;
  favorecido: string;
}
```

## Como Usar

### 1. Importação
O componente já está importado no `app.component.ts`:

```typescript
import { FaturaComponent } from './paginas/fatura/fatura.component';
```

### 2. Utilização no Template
```html
<app-fatura></app-fatura>
```

### 3. Desenvolvimento Local
```bash
npm start
```

## Funcionalidades Detalhadas

### 🔢 Geração de Números
- **Formato**: MMAADHHMM (mês, ano, dia, hora, minuto)
- **Automático**: Gera automaticamente se campo vazio ou valor padrão
- **Manual**: Permite edição manual do número

### 🏦 Consulta CNPJ
- **API**: Integração com ReceitaWS
- **Preenchimento**: Preenche automaticamente dados da empresa
- **Validação**: Validação de CNPJ antes da consulta
- **Fallback**: Tratamento de erros de conexão

### 💰 Sistema PIX
#### Tipos de Chave Suportados:
- **CNPJ**: XX.XXX.XXX/XXXX-XX
- **CPF**: XXX.XXX.XXX-XX
- **Email**: usuario@dominio.com
- **Telefone**: +55 (XX) XXXXX-XXXX
- **Chave Aleatória**: XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX

#### Geração de QR Code:
1. **Payload EMV**: Padrão brasileiro completo
2. **API Externa**: QR Server como fallback
3. **Canvas Local**: Fallback final com informações textuais

### 📄 Exportação de Dados
```json
{
  "tipoDocumento": "Fatura de Serviços",
  "numeroFatura": " 0625032241",
  "cliente": { ... },
  "servicos": [ ... ],
  "pagamento": { ... },
  "valorTotal": 3900.00,
  "dataGeracao": "2025-01-11T..."
}
```

### 🖨️ Impressão
- **CSS específico**: Media queries para impressão
- **Ocultação de elementos**: Botões e elementos interativos ocultos
- **Otimização**: Layout otimizado para papel A4
- **Cores**: Preservação de cores importantes

## Diferenças do Arquivo Original

### ✅ Mantido
- **Design visual**: Layout, cores e tipografia idênticos
- **Funcionalidades**: Todas as funcionalidades JavaScript convertidas
- **Responsividade**: Media queries preservadas
- **PIX**: Sistema PIX completo mantido

### 🔄 Convertido para Angular
- **Two-way binding**: `[(ngModel)]` para todos os campos
- **Event binding**: `(click)`, `(input)`, `(change)` eventos
- **Property binding**: `[value]`, `[class]`, `[style]` propriedades
- **Structural directives**: `*ngFor` para lista de serviços
- **ViewChild**: Acesso a elementos canvas e imagem

### ➕ Melhorias
- **TypeScript**: Tipagem forte e interfaces
- **Componentização**: Código organizado em componente reutilizável
- **Lifecycle hooks**: `ngOnInit` e `ngAfterViewInit`
- **Error handling**: Tratamento robusto de erros
- **Modularidade**: Imports organizados (FormsModule, CommonModule)

## Dependências
- **@angular/core**: Framework base
- **@angular/forms**: FormsModule para two-way binding
- **@angular/common**: CommonModule para pipes e diretivas

## Compatibilidade
- **Angular 17+**: Standalone components
- **Browsers modernos**: ES6+, Canvas API
- **Impressão**: Testado em Chrome, Firefox, Safari
- **Mobile**: Layout responsivo para dispositivos móveis

## Próximos Passos Sugeridos
1. **Testes unitários**: Implementar testes completos
2. **Validação de formulário**: Angular Reactive Forms
3. **PWA**: Transformar em Progressive Web App
4. **Backend**: Integração com API para persistência
5. **Templates**: Sistema de templates personalizáveis 