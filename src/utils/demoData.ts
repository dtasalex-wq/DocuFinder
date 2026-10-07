import { StoredDocument } from '../types';

export const DEMO_DOCUMENTS: StoredDocument[] = [
  {
    id: 'demo_diario_oficial',
    name: 'Diário Oficial – 05/10/2026.pdf',
    size: 2450000,
    uploadDate: new Date('2026-10-05T08:30:00Z').toISOString(),
    pageCount: 42,
    isScanned: false,
    hasOcrProcessed: false,
    pages: [
      {
        pageNumber: 1,
        text: `REPÚBLICA FEDERATIVA DO BRASIL - IMPRENSA NACIONAL
DIÁRIO OFICIAL DA UNIÃO - SEÇÃO 3
Brasília - DF, Segunda-feira, 5 de Outubro de 2026 - Ano CLXV Nº 189
Sumário dos Atos de Licitações, Contratos e Editais Públicos da Administração Direta e Indireta.
Avisos de licitação de órgãos federais, estaduais e municipais em conformidade com a Lei nº 14.133/2021.`,
      },
      {
        pageNumber: 12,
        text: `MINISTÉRIO DA GESTÃO E INOVAÇÃO EM SERVIÇOS PÚBLICOS
AVISO DE ABERTURA DA LICITAÇÃO
Pregão Eletrônico Nº 045/2026 - UASG 110245.
Objeto: Abertura da licitação pública para contratação de serviços continuados de tecnologia da informação, suporte a banco de dados e governança digital.
Entrega das Propostas: a partir de 06/10/2026 às 09:00 horas no portal comprasgovernamentais.gov.br.
Abertura da sessão pública: 19/10/2026 às 10:00 horas. Valor estimado: R$ 4.850.000,00.
Informações complementares e edital completo disponíveis no sítio oficial da pasta.`,
      },
      {
        pageNumber: 18,
        text: `SECRETARIA ESPECIAL DE ADMINISTRAÇÃO PÚBLICA
EXTRATO DE DISPENSA DE LICITAÇÃO Nº 14/2026
Processo nº 48500.001923/2026-88.
Objeto: Contratação emergencial de serviços de manutenção predial e engenharia climática.
Fundamento Legal: Artigo 75, inciso VIII da Lei Federal nº 14.133/2021.
Justificativa: Fica autorizada a contratação da empresa prestadora com base em parecer técnico e dotação orçamentária do exercício vigente.
Ratificação emitida pelo ordenador de despesas em 02/10/2026.`,
      },
      {
        pageNumber: 37,
        text: `SUPERINTENDÊNCIA DE COMPRAS E SUPRIMENTOS
ATO HOMOLOGATÓRIO E RATIFICAÇÃO DE CONTRATO ADMINISTRATIVO
O Superintendente Geral, no uso de suas atribuições legais e regimentais, resolve:
Art. 1º Fica homologado o resultado do Processo Administrativo nº 23078.005412/2026-11.
Art. 2º Em cumprimento ao julgamento da comissão permanente de contratação, fica autorizada a contratação da empresa XYZ LTDA, inscrita no CNPJ sob o nº 12.345.678/0001-90, vencedora do certame para fornecimento e suporte de infraestrutura técnica.
Art. 3º O valor global contratado perfaz o montante de R$ 1.280.000,00 (um milhão e duzentos e oitenta mil reais).
Art. 4º A contratação da empresa XYZ entra em vigência na data de publicação deste extrato no Diário Oficial.
Publique-se e cumpra-se.`,
      },
    ],
  },
  {
    id: 'demo_edital_pregao',
    name: 'Edital de Pregão Eletrônico 042-2026.pdf',
    size: 1180000,
    uploadDate: new Date('2026-10-04T14:15:00Z').toISOString(),
    pageCount: 28,
    isScanned: false,
    hasOcrProcessed: false,
    pages: [
      {
        pageNumber: 1,
        text: `ESTADO DE SÃO PAULO - SECRETARIA DA FAZENDA
EDITAL DE LICITAÇÃO - PREGÃO ELETRÔNICO Nº 042/2026
Critério de Julgamento: Menor Preço Global por Lote.
Modo de Disputa: Aberto e Fechado.
Objeto: Registro de preços para eventual e futura contratação de serviços de digitalização documental e processamento inteligente de arquivos com inteligência e OCR.`,
      },
      {
        pageNumber: 7,
        text: `DO CREDENCIAMENTO E REQUISITOS DE HABILITAÇÃO
Item 4.2. As empresas licitantes deverão comprovar capacidade técnica e idoneidade financeira.
Para fins de qualificação jurídica, a empresa XYZ LTDA ou qualquer consórcio interessado deve anexar certidões negativas de débitos tributários federais e trabalhistas em vigor.
Item 4.3. Será desclassificada a proposta que contiver vícios insanáveis ou valores inexequíveis.`,
      },
      {
        pageNumber: 14,
        text: `DA EXECUÇÃO CONTRATUAL E PRAZOS DE ENTREGA
O prazo para assinatura do termo de contrato administrativo será de 5 (cinco) dias úteis contados da convocação oficial.
A adjudicação do objeto da licitação não implica direito subjetivo à imediata contratação da empresa vencedora antes da emissão da respectiva nota de empenho.`,
      },
    ],
  },
  {
    id: 'demo_digitalizado_portaria',
    name: 'Portaria Conjunta 019-2026 (Digitalizada).pdf',
    size: 3820000,
    uploadDate: new Date('2026-10-03T11:00:00Z').toISOString(),
    pageCount: 5,
    isScanned: true,
    hasOcrProcessed: true,
    pages: [
      {
        pageNumber: 1,
        text: `GABINETE DO PREFEITO MUNICIPAL
PORTARIA CONJUNTA GP/SMG Nº 019/2026 [DOCUMENTO DIGITALIZADO VIA OCR]
Institui o comitê permanente de fiscalização e auditoria de contratos e convênios municipais.
Considerando a necessidade de modernizar a auditoria de prestação de contas dos processos de contratação direta e licitação pública.`,
        isOcr: true,
      },
      {
        pageNumber: 2,
        text: `Art. 3º Competirá ao comitê analisar todas as despesas decorrentes de licitações, termos aditivos e prorrogações de vigência.
Art. 4º Os relatórios circunstanciados serão remetidos trimestralmente ao Tribunal de Contas do Estado.
Publicado no mural de atos e no portal da transparência.`,
        isOcr: true,
      },
    ],
  },
];
