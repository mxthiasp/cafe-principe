/* ============================================================
   DADOS DO CAFÉ (js/cafe.js)
   Telefones, morada, horário, feriados, "sobre nós", avaliações, perguntas frequentes e prato do dia.
   É o ficheiro que mais vais querer editar. Mantém as aspas e as vírgulas como estão.
   ============================================================ */
const TELEFONES = {
  encomendas: "+351 253 572 255",   // número do café
  reservas:   "+351 937 926 144"    // telemóvel do chefe
};

/* ============ DADOS DO CAFÉ (preenche antes de publicar) ============ */
const CAFE = {
  morada: "Praceta de Camões 15, 4805-019 Brito, Portugal",
  tempoPreparacao: "",          // ex.: " Pedidos prontos em 20 a 30 min." (vazio = não aparece)
  fotoHero: matchMedia("(max-width:820px)").matches ? FOTOS.heroMovel : FOTOS.hero,                 // foto do 1.º ecrã do topo (a francesinha)
  /* Mais pratos a rodar no topo. Cada um só aparece quando tiver foto, ex.: foto: "fotos/prego.webp".
     "frase" é o título grande; o nome do prato, a descrição e o preço vêm do menu. Com menos de 2 fotos, o topo fica fixo. */
  slides: [
    {prato: "Francesinha em Pão",  frase: "Toda a francesinha, num pão.",                  foto: FOTOS.heroPao},
    {prato: "Cachorro Especial",   frase: "O cachorro com molho de francesinha.",           foto: FOTOS.heroCachorroEspecial},
    {prato: "Cachorro na Chapa",   frase: "Feito na chapa, com molho de francesinha.",     foto: FOTOS.heroCachorroChapa},
    {prato: "Prego em Prato",      frase: "Bife de vitela, queijo e ovo.",                  foto: ""},      // acrescenta a foto quando a tiveres
    {prato: "Hambúrguer Especial", frase: "O hambúrguer que também leva molho de francesinha.", foto: FOTOS.heroHamburguerEspecial}
  ],
  redes: { instagram: "", facebook: "" },   // links completos; vazio = não aparece
  sobreNos: {
    titulo: "Sobre nós",
    texto: [
      "No Café Príncipe servimos francesinhas, pregos, hambúrgueres, tostas, saladas e muito mais.",
      "A nossa estrela é a Francesinha Especial, com salsa caseira. Podes comer no café, com reserva de mesa, ou encomendar por telefone para levantar."
    ],
    foto: ""                    // ex.: "fotos/cafe.webp" (foto do espaço ou da equipa; vazio = sem foto)
  },
  avaliacoes: {
    itens: [],                  // só avaliações reais, com autorização. Ex.: {nome:"Ana S.", texto:"Excelente francesinha!", estrelas:5}
    linkGoogle: "",             // link das avaliações do vosso Google (opcional)
    linkDeixar: ""              // link para deixar uma avaliação (opcional)
  },
  fotoFachada: "",                       // foto da entrada do café para a secção "Como chegar". Põe o ficheiro na pasta img/ e escreve aqui, por exemplo: RAIZ + "img/fachada.webp"
  enderecosLimpos: true,                 // true = cada prato tem o seu endereço (/prato/francesinha-especial). Precisa do worker.js e do wrangler.jsonc novos
  analitica: { cloudflareToken: "" },   // cola aqui o token do Cloudflare Web Analytics (sem cookies). Vazio = sem estatísticas
  fontesGoogle: false,                   // as letras estão na pasta fonts/; true só se voltarem a vir do Google (a política de privacidade passa a mencioná-lo)
  /* PRATO DO DIA. ativo: true para mostrar.
     Forma fácil: escreve em "prato" o nome EXATO de um prato do menu (js/menu.js). O nome, a descrição, o preço, a foto e as traduções vêm de lá, e o cartão abre o prato.
     Forma livre: deixa "prato" vazio ("") e preenche nome, desc e preco (só em português).
     "ate" = último dia em que aparece, AAAA-MM-DD (ex.: "2026-11-05"). Vazio = até desligares. */
  pratoDoDia: { ativo: false, prato: "", nome: "Prato do dia", desc: "Descrição do prato.", preco: 0, ate: "" },
  /* FAIXA DE AVISO no topo do site (ex.: "Hoje fechamos às 22h", "Encerrado de 10 a 20 de agosto").
     ativo: true para mostrar. "texto" pode ser uma frase em português ou um objeto com várias línguas: { pt:"...", en:"...", fr:"...", de:"...", es:"..." }
     (se faltar uma língua, aparece o português). "ate" = último dia em que aparece, AAAA-MM-DD. Vazio = até desligares. */
  aviso: { ativo: false, texto: "", ate: "" }
};
/* Horário por dia da semana (0 = Domingo ... 6 = Sábado). Podes pôr vários intervalos; [] = fechado. Fecho à meia-noite escreve-se "24:00". */
const HORARIO = {
  0:[["18:00","24:00"]], 1:[["12:00","15:00"],["18:00","23:00"]], 2:[["12:00","15:00"],["18:00","23:00"]], 3:[["12:00","15:00"],["18:00","23:00"]],
  4:[["12:00","15:00"],["18:00","23:00"]], 5:[["12:00","15:00"],["18:00","23:00"]], 6:[["12:00","15:00"],["18:00","24:00"]]
};
/* ============ DIAS ESPECIAIS (feriados e dias de fecho) ============ */
const FERIADO = { abreApartir: "18:00", fechaAs: "24:00" };      // horário de todos os feriados
const FERIADOS_LOCAIS = ["06-24"];              // feriado municipal de Guimarães (24 de junho, Batalha de São Mamede). Apaga se o café abrir normalmente nesse dia
const DIAS_FECHADOS = ["12-25", "01-01"];                       // dias em que o café está fechado, ex.: ["2026-12-25", "08-15"] (AAAA-MM-DD ou MM-DD)

/* perguntas frequentes (só respostas confirmadas; os {números} entram sozinhos) */
const FAQ = [
  ["Fazem entregas ao domicílio?", "Não fazemos entregas. As encomendas são para levantar no café."],
  ["Como faço uma encomenda?", "Por telefone: liga para {tel}, diz-nos o que queres e levanta no café."],
  ["Aceitam reservas de mesa?", "Sim. Reservamos mesa por telefone: liga para {tel_reservas} e diz-nos o dia, a hora e quantas pessoas são."],
  ["Qual é o horário? E nos feriados?", "O nosso horário está na secção Contactos. Nos feriados, só abrimos a partir das {feriado}. Fechamos a 25 de dezembro e a 1 de janeiro."],
  ["Onde fica o café?", "{morada}"],
  ["Que formas de pagamento aceitam?", "Aceitamos dinheiro, Multibanco e MB WAY."],
  ["Há estacionamento?", "Sim, há onde estacionar."]
];

/* ordem dos "Mais pedidos" no início do site */
const ORDEM_DESTAQUES = ["Francesinha Especial","Prego em Prato","Francesinha em Pão"];
