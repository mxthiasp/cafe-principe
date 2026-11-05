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
  legal: { nome: "José Carlos da Silva Gonçalves Carneiro", nif: "184781345" },   // titular do estabelecimento (como na fatura); aparece no rodapé e na política de privacidade. Deixa vazio ("") para esconder
  tempoPreparacao: "",          // ex.: " Pedidos prontos em 20 a 30 min." (vazio = não aparece)
  fotoHeroR: .49,   // telemóvel: onde está o prato na foto vertical (0 = topo, 1 = fundo); usado para o centrar no ecrã
  fotoHero: matchMedia("(max-width:820px)").matches ? FOTOS.heroMovel : FOTOS.hero,                 // foto do 1.º ecrã do topo (a francesinha)
  /* Mais pratos a rodar no topo. Cada um só aparece quando tiver foto, ex.: foto: "fotos/prego.webp".
     "frase" é o título grande; o nome do prato, a descrição e o preço vêm do menu. Com menos de 2 fotos, o topo fica fixo. */
  slides: [
    {prato: "Francesinha em Pão",  frase: "Toda a francesinha, num pão.",                  foto: FOTOS.heroPao, fotoMovel: FOTOS.heroMPao, rMovel: 0.7},
    {prato: "Cachorro Especial",   frase: "O cachorro com molho de francesinha.",           foto: FOTOS.heroCachorroEspecial, fotoMovel: FOTOS.heroMCachorroEspecial, rMovel: 0.61},
    {prato: "Cachorro na Chapa",   frase: "Feito na chapa, com molho de francesinha.",     foto: FOTOS.heroCachorroChapa, fotoMovel: FOTOS.heroMCachorroChapa, rMovel: 0.67},
    {prato: "Prego em Prato",      frase: "Bife de vitela tenro, queijo derretido e ovo estrelado.",                  foto: FOTOS.heroPrego, fotoMovel: FOTOS.heroMPrego, rMovel: 0.57},
    {prato: "Hambúrguer Especial", frase: "O hambúrguer que também leva molho de francesinha.", foto: FOTOS.heroHamburguerEspecial, fotoMovel: FOTOS.heroMHamburguer, rMovel: 0.5}
  ],
  redes: { instagram: "", facebook: "" },   // links completos; vazio = não aparece
  sobreNos: {
    titulo: "Sobre nós",
    texto: [
      "No Café Príncipe servimos francesinhas, pregos, hambúrgueres, tostas, saladas e muito mais.",
      "A nossa estrela é a Francesinha Especial, com molho caseiro. Podes comer no café, com reserva de mesa, ou encomendar por telefone para levantar."
    ],
    foto: "",                   // ex.: "fotos/fachada.webp" (foto da fachada, do espaço ou da equipa)
    fotoProvisoria: true        // enquanto "foto" estiver vazio, mostra uma caixa com o texto "Fachada do café". Põe false para esconder
  },
  /* VÍDEO DA SALSA ("O nosso Molho"): corre sozinho, sem som e em ciclo, de ponta a ponta do ecrã. Vazio = a secção fica como está.
     src: ficheiro MP4 (ou WebM) dentro do site, ex.: "img/salsa.mp4" (horizontal, 10 a 15 segundos, menos de 8 MB). poster: imagem de capa, ex.: "img/salsa-capa.webp" (opcional) */
  salsaVideo: { src: "img/salsa.mp4", poster: "img/salsa-capa.webp" },
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
/* HORÁRIO DO CAFÉ (aberto ao público), por dia da semana (0 = Domingo ... 6 = Sábado). [] = fechado.
   Fecho à meia-noite escreve-se "24:00". Depois da meia-noite continua a contar: 2h da manhã seguinte escreve-se "26:00". */
const HORARIO = {
  0:[["18:00","24:00"]],
  1:[["07:00","24:00"]], 2:[["07:00","24:00"]], 3:[["07:00","24:00"]], 4:[["07:00","24:00"]],
  5:[["07:00","26:00"]], 6:[["07:00","26:00"]]
};
/* HORÁRIO DAS REFEIÇÕES (cozinha: francesinhas, pregos, etc.), mesma regra. Fora destas horas servem-se snacks e café. */
const COZINHA = {
  0:[["18:00","24:00"]],
  1:[["12:00","15:00"],["18:00","24:00"]], 2:[["12:00","15:00"],["18:00","24:00"]], 3:[["12:00","15:00"],["18:00","24:00"]], 4:[["12:00","15:00"],["18:00","24:00"]],
  5:[["12:00","15:00"],["18:00","24:00"]], 6:[["12:00","15:00"],["18:00","24:00"]]
};
/* PREÇO DE MENU: de segunda a sexta, até a esta hora, o preço da refeição inclui bebida e café (algumas bebidas têm acréscimo). Põe "" para desligar a nota. */
const MENU_ATE = "15:00";
/* ============ DIAS ESPECIAIS (feriados e dias de fecho) ============ */
const FERIADO = { abreApartir: "18:00", fechaAs: "24:00" };      // horário de todos os feriados
const FERIADOS_LOCAIS = ["06-24"];              // feriado municipal de Guimarães (24 de junho, Batalha de São Mamede). Apaga se o café abrir normalmente nesse dia
const DIAS_FECHADOS = ["12-25", "01-01"];                       // dias em que o café está fechado, ex.: ["2026-12-25", "08-15"] (AAAA-MM-DD ou MM-DD)

/* perguntas frequentes (só respostas confirmadas; os {números} entram sozinhos) */
const FAQ = [
  ["Fazem entregas ao domicílio?", "Não fazemos entregas. As encomendas são para levantar no café."],
  ["Que formas de pagamento aceitam?", "Aceitamos dinheiro, Multibanco e MB WAY."],
  ["Há estacionamento?", "Sim, há onde estacionar."],
  ["Tenho uma alergia ou intolerância.", "Fala connosco por telefone antes de encomendar."]
];

/* ordem dos "Mais pedidos" no início do site */
const ORDEM_DESTAQUES = ["Francesinha Especial","Prego em Prato","Francesinha em Pão"];
