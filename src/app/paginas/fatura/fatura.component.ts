import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

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

@Component({
  selector: 'app-fatura',
  imports: [FormsModule, CommonModule],
  templateUrl: './fatura.component.html',
  styleUrl: './fatura.component.scss'
})
export class FaturaComponent implements OnInit, AfterViewInit {
  @ViewChild('qrcode', { static: false }) qrcode!: ElementRef<HTMLCanvasElement>;
  @ViewChild('qrcodeFallback', { static: false }) qrcodeFallback!: ElementRef<HTMLImageElement>;

  // Propriedades do documento
  tipoDocumento = 'Fatura de Serviços';
  numeroFatura = ' 0625032241';
  numeroNF = '48';
  dataEmissao: string = '';
  dataVencimento: string = '';
  prazoEntrega = '1 dia útil';
  isNotaFiscalHidden = false;

  // Dados do cliente
  cliente: Cliente = {
    nome: 'TARGET PRODUÇÕES E EVENTOS LTDA',
    cnpj: '20.986.467/0001-60',
    im: '24257120053',
    endereco: 'Rua Cláudio José de Souza, 58',
    bairro: 'União',
    cep: '31170-380',
    cidade: 'Belo Horizonte',
    uf: 'MG',
    email: 'financeiro@ikeventos.com'
  };

  // Serviços
  servicos: Servico[] = [
    { descricao: 'Landing Page Carnaval 2025', periodo: 'Janeiro/2025', valor: '1500.00' },
    { descricao: 'Hospedagem Carnaval 2025', periodo: 'Janeiro/2025', valor: '500.00' },
    { descricao: 'Hospedagem Extra Carnaval 2025', periodo: 'Janeiro/2025', valor: '700.00' },
    { descricao: 'Desenvolvimento Nuvem de Palavras', periodo: 'Maio/2025', valor: '1200.00' }
  ];

  // Dados de pagamento
  pagamento: Pagamento = {
    banco: 'Itaú',
    agencia: '8090',
    conta: '26887-4',
    pixChave: '32.564.153/0001-58',
    favorecido: 'Paulo Roberto Leocadio Veloso'
  };

  // Propriedades computadas
  valorTotal = 0;
  pixLabel = 'PIX (CNPJ)';
  pixDisplay = '';
  footerText = 'Esta fatura refere-se aos serviços de desenvolvimento de sistemas personalizados prestados pela Omni Inovações.';

  ngOnInit() {
    // Definir datas padrão
    const hoje = new Date();
    const proximaSemana = new Date(hoje.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    this.dataEmissao = hoje.toISOString().split('T')[0];
    this.dataVencimento = proximaSemana.toISOString().split('T')[0];

    // Configurações iniciais
    this.calcularTotal();
    this.verificarNotaFiscal();
    this.atualizarDisplayPIX();
    this.autoGerarNumeroSeNecessario();
  }

  ngAfterViewInit() {
    // Aguardar um pouco para garantir que os elementos estejam prontos
    setTimeout(() => {
      this.gerarQRCodePIX();
    }, 500);
  }

  calcularTotal() {
    this.valorTotal = this.servicos.reduce((total, servico) => {
      const valor = parseFloat(servico.valor.replace(',', '.')) || 0;
      return total + valor;
    }, 0);

    // Regenerar QR Code quando o valor mudar
    setTimeout(() => {
      this.gerarQRCodePIX();
    }, 100);
  }

  verificarNotaFiscal() {
    this.isNotaFiscalHidden = this.numeroNF === '0' || this.numeroNF === '';
  }

  atualizarTipoDocumento() {
    if (this.tipoDocumento === 'Orçamento') {
      this.footerText = 'Este orçamento refere-se aos serviços de desenvolvimento de sistemas personalizados da Omni Inovações.';
    } else {
      this.footerText = 'Esta fatura refere-se aos serviços de desenvolvimento de sistemas personalizados prestados pela Omni Inovações.';
    }
  }

  adicionarServico() {
    this.servicos.push({
      descricao: '',
      periodo: '',
      valor: '0.00'
    });
    this.calcularTotal();
  }

  removerServico(index: number) {
    if (confirm('Tem certeza que deseja remover este serviço?')) {
      this.servicos.splice(index, 1);
      this.calcularTotal();
    }
  }

  gerarNumeroFatura() {
    const agora = new Date();
    
    // Extrair componentes da data/hora
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = String(agora.getFullYear()).slice(-2);
    const dia = String(agora.getDate()).padStart(2, '0');
    const hora = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    
    // Montar número no formato: MMAADHHMM
    const numeroGerado = mes + ano + dia + hora + minutos;
    
    // Definir no campo (com espaço no início para manter padrão visual)
    this.numeroFatura = ' ' + numeroGerado;
    
    console.log(`Número gerado: ${numeroGerado}`);
    console.log(`Data/Hora: ${agora.toLocaleString('pt-BR')}`);
  }

  autoGerarNumeroSeNecessario() {
    const numeroAtual = this.numeroFatura.trim();
    
    // Se o campo estiver vazio, com valor padrão ou muito antigo, gerar novo número
    if (!numeroAtual || numeroAtual === '0625032241' || numeroAtual.length < 10) {
      this.gerarNumeroFatura();
    }
  }

  detectarTipoChavePIX(chave: string) {
    // Remover espaços
    chave = chave.trim();
    
    if (!chave) return { tipo: 'PIX', display: '' };
    
    // CNPJ (com ou sem formatação)
    const cnpjRegex = /^\d{2}\.?\d{3}\.?\d{3}\/?\d{4}-?\d{2}$/;
    if (cnpjRegex.test(chave)) {
      return { 
        tipo: 'PIX (CNPJ)', 
        display: chave.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5') 
      };
    }
    
    // CPF (com ou sem formatação)
    const cpfRegex = /^\d{3}\.?\d{3}\.?\d{3}-?\d{2}$/;
    if (cpfRegex.test(chave)) {
      return { 
        tipo: 'PIX (CPF)', 
        display: chave.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4') 
      };
    }
    
    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(chave)) {
      return { tipo: 'PIX (E-mail)', display: chave };
    }
    
    // Telefone (com ou sem formatação)
    const telefoneRegex = /^(\+55\s?)?(\(?\d{2}\)?\s?)?\d{4,5}-?\d{4}$/;
    if (telefoneRegex.test(chave)) {
      return { tipo: 'PIX (Telefone)', display: chave };
    }
    
    // Chave aleatória (EVP)
    const chaveAleatoria = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
    if (chaveAleatoria.test(chave)) {
      return { tipo: 'PIX (Chave Aleatória)', display: chave };
    }
    
    // Se não identificou o tipo, assume como chave genérica
    return { tipo: 'PIX', display: chave };
  }

  atualizarPIX() {
    // Detectar o tipo da chave
    const resultado = this.detectarTipoChavePIX(this.pagamento.pixChave);
    
    // Atualizar o label do campo
    this.pixLabel = resultado.tipo + ':';
    
    // Atualizar o display abaixo do QR Code
    const tipoSemPIX = resultado.tipo.replace('PIX ', '').replace('(', '').replace(')', '');
    this.pixDisplay = `<strong>${tipoSemPIX}:</strong> ${resultado.display}`;
    
    // Regenerar QR Code com nova chave
    setTimeout(() => {
      this.gerarQRCodePIX();
    }, 100);
  }

  atualizarDisplayPIX() {
    // Atualizar o display inicial
    this.atualizarPIX();
  }

  criarPayloadPIXCorreto(valor: number): string {
    // Função para formatar campos EMV
    const formatarCampo = (id: string, conteudo: string): string => {
      const tamanho = conteudo.length.toString().padStart(2, '0');
      return id + tamanho + conteudo;
    };

    // Pegar a chave PIX atual e remover formatação
    const chavePix = this.pagamento.pixChave.replace(/[^\d]/g, '');
    const nome = 'Paulo Roberto Leocadio Veloso';
    const cidade = 'Brasilia';

    let payload = '';

    // 00 - Payload Format Indicator
    payload += formatarCampo('00', '01');

    // 01 - Point of Initiation Method (11 = estático, 12 = dinâmico)
    payload += formatarCampo('01', '11');

    // 26 - Merchant Account Information (PIX)
    let merchantInfo = formatarCampo('00', 'BR.GOV.BCB.PIX') + formatarCampo('01', chavePix);
    payload += formatarCampo('26', merchantInfo);

    // 52 - Merchant Category Code
    payload += formatarCampo('52', '0000');

    // 53 - Transaction Currency (986 = BRL)
    payload += formatarCampo('53', '986');

    // 54 - Transaction Amount (apenas se valor > 0)
    if (valor && valor > 0) {
      payload += formatarCampo('54', valor.toFixed(2));
    }

    // 58 - Country Code
    payload += formatarCampo('58', 'BR');

    // 59 - Merchant Name (sem acentos, máximo 25 caracteres)
    const nomeLimpo = nome.replace(/[àáâãäéêëíîïóôõöúûüç]/gi, (match) => {
      const acentos = 'àáâãäéêëíîïóôõöúûüç';
      const semAcentos = 'aaaaaeeeiiioooouuuc';
      return semAcentos[acentos.indexOf(match.toLowerCase())];
    });
    payload += formatarCampo('59', nomeLimpo.substring(0, 25));

    // 60 - Merchant City (sem acentos, máximo 15 caracteres)
    payload += formatarCampo('60', cidade.substring(0, 15));

    // 62 - Additional Data Field Template (opcional)
    const txId = 'FAT' + Date.now().toString().slice(-9);
    let additionalData = formatarCampo('05', txId.substring(0, 25));
    payload += formatarCampo('62', additionalData);

    // 63 - CRC16
    payload += '6304';
    const crc = this.calcularCRC16Simples(payload);
    payload += crc;

    return payload;
  }

  calcularCRC16Simples(payload: string): string {
    let crc = 0xFFFF;
    const poly = 0x1021;

    for (let i = 0; i < payload.length; i++) {
      crc ^= (payload.charCodeAt(i) << 8);
      for (let j = 0; j < 8; j++) {
        if (crc & 0x8000) {
          crc = (crc << 1) ^ poly;
        } else {
          crc = crc << 1;
        }
        crc = crc & 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  async gerarQRCodePIX(valor?: number) {
    // Se valor não foi passado, usar o total atual
    if (valor === undefined) {
      valor = this.valorTotal;
    }

    // Criar payload PIX correto
    const pixPayload = this.criarPayloadPIXCorreto(valor);
    console.log('Payload PIX:', pixPayload);

    try {
      // Usar API do QR Server com o payload correto
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pixPayload)}`;
      
      if (this.qrcodeFallback) {
        this.qrcodeFallback.nativeElement.onload = () => {
          if (this.qrcode) {
            this.qrcode.nativeElement.style.display = 'none';
          }
          this.qrcodeFallback.nativeElement.style.display = 'block';
          console.log('QR Code PIX carregado via API online!');
        };
        
        this.qrcodeFallback.nativeElement.onerror = () => {
          console.log('Erro na API online, usando fallback manual...');
          this.mostrarPixCopiaCola(valor!);
        };
        
        this.qrcodeFallback.nativeElement.src = qrUrl;
      }
    } catch (error) {
      console.log('Erro na API online, usando fallback manual...');
      this.mostrarPixCopiaCola(valor);
    }
  }

  mostrarPixCopiaCola(valor: number) {
    if (!this.qrcode) return;

    const canvas = this.qrcode.nativeElement;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    canvas.style.display = 'block';
    if (this.qrcodeFallback) {
      this.qrcodeFallback.nativeElement.style.display = 'none';
    }
    
    canvas.width = 150;
    canvas.height = 150;
    
    // Fundo branco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, 150, 150);
    
    // Borda
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 148, 148);
    
    // Texto
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PIX', 75, 25);
    
    ctx.font = '12px Arial';
    ctx.fillText('CNPJ:', 75, 45);
    ctx.font = '10px Arial';
    ctx.fillText('32.564.153/0001-58', 75, 60);
    
    ctx.font = '12px Arial';
    ctx.fillText(`Valor: R$ ${valor.toFixed(2)}`, 75, 80);
    
    ctx.font = '8px Arial';
    ctx.fillText('Use a chave PIX acima', 75, 100);
    ctx.fillText('no app do seu banco', 75, 110);
    ctx.fillText('para fazer o pagamento', 75, 120);
    
    console.log('Exibindo informações PIX como fallback final');
  }

  gerarPixSimples() {
    // Criar payload PIX ultra simples
    const chavePix = this.pagamento.pixChave.replace(/[^\d]/g, '');
    
    let pixSimples = `00020126360014BR.GOV.BCB.PIX0114${chavePix}5204000053039865802BR5925Paulo Roberto L Veloso6008Brasilia`;
    
    if (this.valorTotal > 0) {
      const valorStr = this.valorTotal.toFixed(2);
      const tamanhoValor = valorStr.length.toString().padStart(2, '0');
      pixSimples = `00020126360014BR.GOV.BCB.PIX0114${chavePix}5204000053039865402${tamanhoValor}${valorStr}5802BR5925Paulo Roberto L Veloso6008Brasilia`;
    }
    
    // Adicionar CRC
    pixSimples += '6304';
    const crc = this.calcularCRC16Simples(pixSimples);
    pixSimples += crc;
    
    console.log('PIX Simples:', pixSimples);
    
    // Usar API diretamente
    if (this.qrcodeFallback) {
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(pixSimples)}`;
      this.qrcodeFallback.nativeElement.src = qrUrl;
      if (this.qrcode) {
        this.qrcode.nativeElement.style.display = 'none';
      }
      this.qrcodeFallback.nativeElement.style.display = 'block';
    }
  }

  async consultarCNPJ() {
    // Pegar o CNPJ e limpar formatação
    let cnpj = this.cliente.cnpj.replace(/[^\d]/g, '');
    
    // Validar se tem 14 dígitos
    if (cnpj.length !== 14) {
      alert('Por favor, digite um CNPJ válido com 14 dígitos.');
      return;
    }
    
    try {
      // Fazer requisição para a API da ReceitaWS
      const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpj}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erro na consulta: ${response.status}`);
      }
      
      const dados = await response.json();
      
      // Verificar se a consulta foi bem-sucedida
      if (dados.status === 'ERROR') {
        throw new Error(dados.message || 'Erro na consulta do CNPJ');
      }
      
      // Preencher os campos com os dados retornados
      this.preencherDadosCliente(dados);
      
    } catch (error: any) {
      console.error('Erro ao consultar CNPJ:', error);
      alert(`Erro ao consultar CNPJ: ${error.message}\n\nVerifique sua conexão com a internet e tente novamente.`);
    }
  }

  preencherDadosCliente(dados: any) {
    try {
      // Nome da empresa (usar fantasia se disponível, senão usar nome)
      const nomeEmpresa = dados.fantasia && dados.fantasia.trim() !== '' ? dados.fantasia : dados.nome;
      if (nomeEmpresa) {
        this.cliente.nome = nomeEmpresa;
      }
      
      // CNPJ formatado
      if (dados.cnpj) {
        this.cliente.cnpj = dados.cnpj;
      }
      
      // Endereço completo
      let endereco = '';
      if (dados.logradouro) {
        endereco = dados.logradouro;
        if (dados.numero) {
          endereco += ', ' + dados.numero;
        }
        if (dados.complemento) {
          endereco += ', ' + dados.complemento;
        }
        this.cliente.endereco = endereco;
      }
      
      // Bairro
      if (dados.bairro) {
        this.cliente.bairro = dados.bairro;
      }
      
      // CEP
      if (dados.cep) {
        this.cliente.cep = dados.cep;
      }
      
      // Cidade
      if (dados.municipio) {
        this.cliente.cidade = dados.municipio;
      }
      
      // UF
      if (dados.uf) {
        this.cliente.uf = dados.uf;
      }
      
      // Email
      if (dados.email) {
        this.cliente.email = dados.email;
      }
      
      // Limpar campo IM (pois não vem na API)
      this.cliente.im = '';
      
      console.log('Dados do cliente preenchidos com sucesso:', dados);
      
    } catch (error) {
      console.error('Erro ao preencher dados do cliente:', error);
      alert('Erro ao preencher os dados. Alguns campos podem não ter sido preenchidos corretamente.');
    }
  }

  salvarDadosJSON() {
    // Coletar todos os dados da fatura
    const dados = {
      // Informações do documento
      tipoDocumento: this.tipoDocumento,
      numeroFatura: this.numeroFatura,
      numeroNF: this.numeroNF,
      dataEmissao: this.dataEmissao,
      dataVencimento: this.dataVencimento,
      
      // Informações do cliente
      cliente: this.cliente,
      
      // Prazo de entrega (apenas para orçamentos)
      prazoEntrega: this.prazoEntrega,
      
      // Serviços
      servicos: this.servicos.map(servico => ({
        descricao: servico.descricao,
        periodo: servico.periodo,
        valor: parseFloat(servico.valor.replace(',', '.')) || 0
      })),
      
      // Dados de pagamento
      pagamento: this.pagamento,
      
      // Valor total
      valorTotal: this.valorTotal,
      
      // Data de geração
      dataGeracao: new Date().toISOString()
    };
    
    // Criar arquivo JSON e fazer download
    const dataStr = JSON.stringify(dados, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    
    // Nome do arquivo baseado no tipo de documento e número
    const tipoDoc = dados.tipoDocumento.toLowerCase().replace(' ', '_');
    const numero = dados.numeroFatura.replace(/\s/g, '');
    const dataAtual = new Date().toISOString().split('T')[0];
    link.download = `${tipoDoc}_${numero}_${dataAtual}.json`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Feedback para o usuário
    alert('Dados salvos em JSON com sucesso!');
  }

  carregarDadosJSON(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e: any) => {
      try {
        const dados = JSON.parse(e.target.result);
        
        // Carregar informações do documento
        if (dados.tipoDocumento) this.tipoDocumento = dados.tipoDocumento;
        if (dados.numeroFatura) this.numeroFatura = dados.numeroFatura;
        if (dados.numeroNF) this.numeroNF = dados.numeroNF;
        if (dados.dataEmissao) this.dataEmissao = dados.dataEmissao;
        if (dados.dataVencimento) this.dataVencimento = dados.dataVencimento;
        
        // Carregar informações do cliente
        if (dados.cliente) {
          this.cliente = { ...this.cliente, ...dados.cliente };
        }
        
        // Carregar prazo de entrega
        if (dados.prazoEntrega) this.prazoEntrega = dados.prazoEntrega;
        
        // Carregar dados de pagamento
        if (dados.pagamento) {
          this.pagamento = { ...this.pagamento, ...dados.pagamento };
        }
        
        // Carregar serviços
        if (dados.servicos && dados.servicos.length > 0) {
          this.servicos = dados.servicos.map((servico: any) => ({
            descricao: servico.descricao || '',
            periodo: servico.periodo || '',
            valor: servico.valor ? servico.valor.toFixed(2) : '0.00'
          }));
        }
        
        // Atualizar tipo de documento para aplicar as configurações corretas
        this.atualizarTipoDocumento();
        
        // Verificar nota fiscal
        this.verificarNotaFiscal();
        
        // Atualizar PIX
        this.atualizarDisplayPIX();
        
        // Recalcular total
        this.calcularTotal();
        
        // Feedback para o usuário
        alert('Dados carregados com sucesso!');
        
      } catch (error) {
        alert('Erro ao carregar o arquivo JSON. Verifique se o arquivo está no formato correto.');
        console.error('Erro ao carregar JSON:', error);
      }
    };
    
    reader.readAsText(file);
    
    // Limpar o input para permitir carregar o mesmo arquivo novamente
    event.target.value = '';
  }

  imprimir() {
    window.print();
  }

  formatarValor(valor: number): string {
    return valor.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
