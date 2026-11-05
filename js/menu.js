/* ============================================================
   MENU E FOTOS (js/menu.js)
   Pratos, descrições e preços. Para mudar um preço, procura o prato e altera o número em "preco".
   preco:0 significa "ainda sem preço" (aparece "Preço a confirmar").
   As fotos estão na pasta img/ e ligadas aqui, em FOTOS. Para pôr uma foto num prato, junta foto:FOTOS.nome.
   ============================================================ */
/* ============ FOTOS (incorporadas no ficheiro, por isso aparecem sempre) ============
   Para trocar uma foto, substitui o valor por um caminho, ex.: "fotos/nova.webp" */
/* as fotos ficam em ficheiros à parte (pasta img/): o navegador guarda-as em cache e a página abre muito mais depressa */
const RAIZ = /^https?:/.test(location.protocol) ? "/" : "./";
const FOTOS = {
  hero: RAIZ + "img/hero.webp",
  heroMovel: RAIZ + "img/hero-v-francesinha-especial.webp",   // topo no telemóvel (foto vertical)
  heroMPao: RAIZ + "img/hero-v-francesinha-em-pao.webp",
  heroMCachorroEspecial: RAIZ + "img/hero-v-cachorro-especial.webp",
  heroMCachorroChapa: RAIZ + "img/hero-v-cachorro-na-chapa.webp",
  heroMPrego: RAIZ + "img/hero-v-prego-em-prato.webp",
  heroMHamburguer: RAIZ + "img/hero-v-hamburguer-especial-2.webp",
  tosta: RAIZ + "img/tosta-mista.webp",
  cachorroChapa: RAIZ + "img/cachorro-na-chapa.webp",
  francesinhaPao: RAIZ + "img/francesinha-em-pao.webp",
  cachorroEspecial: RAIZ + "img/cachorro-especial.webp",
  heroPao: RAIZ + "img/hero-francesinha-em-pao-2.webp",
  heroCachorroEspecial: RAIZ + "img/hero-cachorro-especial-2.webp",
  heroPrego: RAIZ + "img/hero-prego-em-prato-2.webp",
  heroCachorroChapa: RAIZ + "img/hero-cachorro-na-chapa-2.webp",
  especial: RAIZ + "img/francesinha-especial.webp",
  superEspecial: RAIZ + "img/super-francesinha-especial.webp",
  meiaEspecial: RAIZ + "img/meia-francesinha-especial.webp",
  hamburguerPao: RAIZ + "img/hamburguer-em-pao.webp",
  hamburguerEspecial: RAIZ + "img/hamburguer-especial.webp",
  heroHamburguerEspecial: RAIZ + "img/hero-hamburguer-especial-2.webp",
  pregoPrato: RAIZ + "img/prego-em-prato.webp",
  sandesFiambre: RAIZ + "img/sandes-de-fiambre.webp",
  sandesQueijo: RAIZ + "img/sandes-de-queijo.webp",
  sandesMista: RAIZ + "img/sandes-mista.webp",
  pregoPratoFrango: RAIZ + "img/prego-em-prato-de-frango.webp",
  baguetaAtum: RAIZ + "img/baguete-de-atum.webp",
  omeleteCamarao: RAIZ + "img/omelete-de-camarao.webp"
};

/* ============ DADOS DO MENU (edita nomes, preços e descrições) ============ */
const MENU = {
  /* Preços e descrições conforme o menu do café. preco:0 = ainda sem preço. Campos opcionais: foto:FOTOS.nome */
  "Francesinhas": [
    {nome:"Super Francesinha Especial", desc:"Pão, bife de vitela, salsicha, chouriço, fiambre, queijo, ketchup, mostarda, ovo e molho de francesinha. Com batata.", preco:13.5, foto:FOTOS.superEspecial},
    {nome:"Francesinha Especial", desc:"Pão, bife de vitela, chouriço, fiambre, queijo, ketchup, mostarda, ovo e molho de francesinha. Com batata.", preco:12.0, foto:FOTOS.especial, nota:"O nosso prato estrela, feito com o nosso molho caseiro."},
    {nome:"Meia Francesinha Especial", desc:"Pão, bife de vitela, chouriço, fiambre, queijo, ketchup, mostarda, ovo e molho de francesinha. Com batata.", preco:8.75, foto:FOTOS.meiaEspecial},
    {nome:"Francesinha Especial de Frango", desc:"Pão, bife de frango, chouriço, fiambre, queijo, ketchup, mostarda, ovo e molho de francesinha. Com batata.", preco:10.5, foto:FOTOS.especial},
    {nome:"Francesinha Especial de Camarão", desc:"Pão, bife de vitela, camarão, chouriço, fiambre, queijo, ketchup, mostarda, ovo e molho de francesinha. Com batata.", preco:15.5},
    {nome:"Francesinha na Chapa", desc:"Pão, bife de vitela, fiambre, queijo, ovo e molho de francesinha. Com batata.", preco:11.75},
    {nome:"Francesinha em Pão", desc:"Pão barrado com molho de francesinha, chouriço, ketchup, mostarda, queijo e fiambre.", preco:4.75, foto:FOTOS.francesinhaPao}
  ],
  "Pregos": [
    {nome:"Prego em Pão", desc:"Pão, bife de vitela, fiambre e queijo.", preco:5.75},
    {nome:"Prego em Pão c/ Ovo", desc:"Pão, bife de vitela, fiambre, queijo e ovo.", preco:6.5},
    {nome:"Prego em Prato", desc:"Bife de vitela, fiambre, queijo, alface, tomate e ovo. Com batata.", preco:12.5, foto:FOTOS.pregoPrato},
    {nome:"Prego em Prato de Frango", desc:"Bife de frango, fiambre, queijo, alface, tomate e ovo. Com batata.", preco:0, foto:FOTOS.pregoPratoFrango}
  ],
  "Bifes e Panados": [
    {nome:"Bife de Frango em Pão", desc:"Pão, bife de frango, fiambre e queijo.", preco:4.0},
    {nome:"Panado no Pão", desc:"Pão, panado de porco, fiambre e queijo.", preco:2.75},
    {nome:"Panado em Prato", desc:"Panado de porco, fiambre, queijo e ovo. Com batata.", preco:10.0}
  ],
  "Cachorros": [
    {nome:"Cachorro em Pão", desc:"Pão barrado com molho de francesinha, salsicha, fiambre, queijo, ketchup e mostarda.", preco:4.75},
    {nome:"Cachorro Especial", desc:"Pão, salsicha, fiambre, queijo, ketchup, mostarda e molho de francesinha. Com batata.", preco:11.0, foto:FOTOS.cachorroEspecial},
    {nome:"Cachorro na Chapa", desc:"Pão, salsicha, fiambre, queijo e molho de francesinha. Com batata.", preco:11.0, foto:FOTOS.cachorroChapa}
  ],
  "Hambúrgueres": [
    {nome:"Hambúrguer em Pão", desc:"Pão, hambúrguer, alface, tomate, queijo, fiambre, ovo, ketchup e mostarda.", preco:5.75, foto:FOTOS.hamburguerPao},
    {nome:"Hambúrguer Especial", desc:"Pão, hambúrguer, fiambre, queijo, alface, tomate, ovo, ketchup, mostarda e molho de francesinha. Com batata.", preco:11.5, foto:FOTOS.hamburguerEspecial},
    {nome:"Hambúrguer de Picanha em Pão", desc:"Pão, hambúrguer, fiambre, queijo cheddar, alface, tomate, bacon e molho Big Burger. Com batata.", preco:10.5}
  ],
  "Baguetes": [
    {nome:"Prego em Baguete c/ Ovo", desc:"Baguete, bife de vitela, fiambre, queijo e ovo.", preco:9.5},
    {nome:"Baguete de Atum", desc:"Baguete, maionese, alface, tomate, fiambre, queijo, atum e ovo.", preco:5.0, foto:FOTOS.baguetaAtum},
    {nome:"Baguete Americana", desc:"Baguete, maionese, alface, tomate, fiambre, queijo e ovo.", preco:4.75}
  ],
  "Sandes e Tostas": [
    {nome:"Sandes de Fiambre", desc:"Pão e fiambre.", preco:1.5, foto:FOTOS.sandesFiambre},
    {nome:"Sandes de Queijo", desc:"Pão e queijo.", preco:1.6, foto:FOTOS.sandesQueijo},
    {nome:"Sandes Mista", desc:"Pão, queijo e fiambre.", preco:2.5, foto:FOTOS.sandesMista},
    {nome:"Torrada em Pão de Forma", desc:"Pão de forma barrado com manteiga.", preco:1.3},
    {nome:"Tosta Mista", desc:"Pão barrado com manteiga, queijo e fiambre.", preco:3.5, foto:FOTOS.tosta}
  ],
  "Omeletes": [
    {nome:"Omelete Mista", desc:"Ovo, alface, tomate, cenoura, milho, fiambre e queijo. Com batata. Molho à escolha: iogurte ou azeite e vinagre.", preco:9.5},
    {nome:"Omelete de Fiambre", desc:"Ovo, alface, tomate, cenoura, milho e fiambre. Com batata. Molho à escolha: iogurte ou azeite e vinagre.", preco:8.75},
    {nome:"Omelete de Queijo", desc:"Ovo, alface, tomate, cenoura, milho e queijo. Com batata. Molho à escolha: iogurte ou azeite e vinagre.", preco:9.0},
    {nome:"Omelete de Camarão", desc:"Ovo, camarão, alface, tomate, cenoura, milho, queijo e fiambre. Com batata. Molho à escolha: iogurte ou azeite e vinagre.", preco:14.0, foto:FOTOS.omeleteCamarao}
  ],
  "Saladas": [
    {nome:"Salada Mista", desc:"Alface, tomate, cenoura, milho, fiambre e queijo. Molho à escolha: iogurte ou azeite e vinagre.", preco:7.0},
    {nome:"Salada de Atum", desc:"Alface, tomate, cenoura, milho e atum. Com batata. Molho à escolha: iogurte ou azeite e vinagre.", preco:7.5},
    {nome:"Bife de Frango c/ Salada e Batata", desc:"Bife de frango, alface, tomate, fiambre, queijo, cenoura e milho. Com batata. Molho à escolha: iogurte ou azeite e vinagre.", preco:9.25}
  ],
  "Picadinhos": [
    {nome:"Picadinho de Vitela", desc:"Carne de vitela, salsicha, chouriço, pickles, azeitonas e molho de francesinha. Com batata.", preco:12.0},
    {nome:"Meio Picadinho de Vitela", desc:"Carne de vitela, salsicha, chouriço, pickles, azeitonas e molho de francesinha. Com batata.", preco:8.75}
  ],
  "Entradas": [
    {nome:"Pão de Alho", desc:"", preco:2.75},
    {nome:"Pão de Alho c/ Bacon", desc:"Com bacon.", preco:4.5},
    {nome:"Asinhas de Frango", desc:"Asinhas de frango fritas.", preco:4.5},
    {nome:"Rissóis de Carne", desc:"6 rissóis de carne.", preco:4.2},
    {nome:"Bolinhos de Bacalhau", desc:"6 bolinhos de bacalhau.", preco:4.8}
  ],
  "Menu Infantil": [
    {nome:"Mini Prego de Vitela com Ovo", desc:"Mini prego de vitela com ovo.", preco:8.75},
    {nome:"Bife de Frango com Batata", desc:"Bife de frango com batata.", preco:5.5},
    {nome:"2 Salsichas com Batata e Ovo", desc:"Duas salsichas com batata e ovo.", preco:4.5},
    {nome:"Hambúrguer com Ovo e Batata", desc:"Hambúrguer com ovo e batata.", preco:4.75}
  ],
  "Sobremesas": [
    {nome:"Sobremesa", desc:"Qualquer sobremesa do dia, ao mesmo preço. Pergunta-nos quais temos.", preco:2.5}
  ]
};
