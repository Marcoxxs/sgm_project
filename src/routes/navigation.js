import HomeOutlined from "@mui/icons-material/HomeOutlined";
import PersonAddAlt1Outlined from "@mui/icons-material/PersonAddAlt1Outlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import QueryStatsOutlined from "@mui/icons-material/QueryStatsOutlined";
import StickyNote2Outlined from "@mui/icons-material/StickyNote2Outlined";
import HelpOutline from "@mui/icons-material/HelpOutline";

export const navigation = [
  { path: "/", label: "Home", Icon: HomeOutlined },
  {
    path: "/cadastros", label: "Cadastros", Icon: PersonAddAlt1Outlined,
    description: "Cadastro de alunos e visitantes em um único lugar.",
    details: "O formulário de cadastro será disponibilizado nesta seção.",
  },
  {
    path: "/registros", label: "Registros", Icon: FactCheckOutlined,
    description: "Consulta de pessoas cadastradas e históricos de acesso.",
    details: "A busca e o histórico de acesso serão disponibilizados nesta seção.",
  },
  {
    path: "/dashboard", label: "Dashboard", Icon: QueryStatsOutlined,
    description: "Indicadores de utilização dos laboratórios.",
    details: "Os filtros e gráficos serão disponibilizados quando houver dados de utilização.",
  },
  {
    path: "/anotacoes", label: "Anotações", Icon: StickyNote2Outlined,
    description: "Mural de recados da equipe de monitoria.",
    details: "O mural compartilhado será disponibilizado nesta seção.",
  },
  {
    path: "/ajuda", label: "Ajuda", Icon: HelpOutline,
    description: "Orientações para o uso do SGMLab.",
    details: "As perguntas frequentes e os contatos oficiais serão disponibilizados nesta seção.",
  },
];
