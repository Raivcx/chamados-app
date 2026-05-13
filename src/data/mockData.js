export const MOCK_USERS = [
  { id: '1', username: 'admin', nome: 'Administrador', email: 'admin@techsupport.com', cargo: 'admin', telefone: '(11) 99999-0001', avatar: null, senha: 'admin' },
  { id: '2', username: 'carlos', nome: 'Carlos Silva', email: 'carlos@techsupport.com', cargo: 'tecnico', telefone: '(11) 99999-0002', avatar: null, senha: '123456' },
  { id: '3', username: 'ana', nome: 'Ana Souza', email: 'ana@empresa.com', cargo: 'cliente', telefone: '(11) 99999-0003', avatar: null, senha: '123456' },
];

export const MOCK_CATEGORIES = [
  { id: '1', nome: 'Informática/TI' },
  { id: '2', nome: 'Elétrica' },
  { id: '3', nome: 'Predial/Civil' },
  { id: '4', nome: 'Segurança Eletrônica' },
  { id: '5', nome: 'Telecomunicações' },
];

export const MOCK_STATUSES = [
  { id: '1', nome: 'Aberto', cor: '#ffb4ab' },
  { id: '2', nome: 'Em Progresso', cor: '#b9c8de' },
  { id: '3', nome: 'Pendente', cor: '#d6c3b5' },
  { id: '4', nome: 'Validando', cor: '#c5c6cb' },
  { id: '5', nome: 'Concluído', cor: '#4ade80' },
  { id: '6', nome: 'Aguardando Cliente', cor: '#fbbf24' },
  { id: '7', nome: 'Aguardando Suporte', cor: '#60a5fa' },
];

export const MOCK_PRIORITIES = [
  { id: '1', nome: 'Crítica', cor: '#ffb4ab' },
  { id: '2', nome: 'Alta', cor: '#ffffff' },
  { id: '3', nome: 'Média', cor: '#c5c6cb' },
  { id: '4', nome: 'Baixa', cor: '#8e9195' },
];

export const MOCK_TICKETS = [
  { id: 'INC-0421', assunto: 'Falha geral na rede Wi-Fi andar 3', categoria_id: '1', prioridade_id: '1', status_id: '2', criado_por: '3', atribuido_a: '2', data_criacao: '2026-05-12T10:30:00', data_fechamento: null, descricao: 'A rede Wi-Fi do andar 3 está completamente fora do ar desde as 10h. Nenhum dispositivo consegue se conectar.' },
  { id: 'REQ-1092', assunto: 'Troca de lâmpadas no refeitório sul', categoria_id: '2', prioridade_id: '4', status_id: '3', criado_por: '3', atribuido_a: null, data_criacao: '2026-05-11T14:00:00', data_fechamento: null, descricao: 'Várias lâmpadas do refeitório sul estão queimadas e precisam ser substituídas.' },
  { id: 'INC-0418', assunto: 'Vazamento ar condicionado sala de reuniões A', categoria_id: '3', prioridade_id: '3', status_id: '4', criado_por: '3', atribuido_a: '2', data_criacao: '2026-05-10T09:15:00', data_fechamento: null, descricao: 'O ar condicionado da sala de reuniões A está com vazamento de água.' },
  { id: 'REQ-1105', assunto: 'Instalação de novo software ERP', categoria_id: '1', prioridade_id: '2', status_id: '3', criado_por: '3', atribuido_a: null, data_criacao: '2026-05-09T16:45:00', data_fechamento: null, descricao: 'Necessária a instalação do novo ERP em 15 estações de trabalho.' },
  { id: 'INC-0399', assunto: 'Câmera portão principal inoperante', categoria_id: '4', prioridade_id: '1', status_id: '2', criado_por: '3', atribuido_a: '2', data_criacao: '2026-05-08T08:00:00', data_fechamento: null, descricao: 'A câmera de segurança do portão principal parou de funcionar.' },
  { id: 'INC-0385', assunto: 'Impressora do RH travando constantemente', categoria_id: '1', prioridade_id: '3', status_id: '5', criado_por: '3', atribuido_a: '2', data_criacao: '2026-05-05T11:20:00', data_fechamento: '2026-05-07T15:00:00', descricao: 'A impressora HP do departamento de RH está travando a cada impressão.' },
  { id: 'REQ-1080', assunto: 'Reparar portão eletrônico garagem', categoria_id: '3', prioridade_id: '2', status_id: '5', criado_por: '3', atribuido_a: '2', data_criacao: '2026-05-04T13:30:00', data_fechamento: '2026-05-06T10:00:00', descricao: 'O portão eletrônico da garagem não está abrindo com o controle remoto.' },
];

export const MOCK_HELP_INFO = {
  texto: 'Para suporte emergencial, entre em contato com nossa equipe.',
  email: 'suporte@techsupport.com',
  telefone: '(11) 3000-1234',
  site: 'https://techsupport.com/ajuda',
};

export const MOCK_SYSTEM_SETTINGS = {
  titulo: 'Suporte Técnico',
  subtitulo: 'Operacional',
  logo: null,
};
