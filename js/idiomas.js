/* ============================================================
   IDIOMAS (js/idiomas.js) — carrega sempre
   A lista de línguas, as bandeiras e os textos em português que o site precisa logo à entrada.
   As traduções (inglês, francês, alemão, espanhol) estão em js/traducoes.js, que só é descarregado
   quando alguém escolhe uma língua que não é o português.
   ============================================================ */
const IDIOMAS = {pt:"Português", en:"English", fr:"Français", de:"Deutsch", es:"Español"};
/* bandeiras em desenho vetorial (as de emoji não aparecem no Windows) */
const BANDEIRAS = {
  pt:'<svg viewBox="0 0 30 20" preserveAspectRatio="xMidYMid slice" shape-rendering="geometricPrecision"><rect width="30" height="20" fill="#FF0000"/><rect width="12" height="20" fill="#006600"/><circle cx="12" cy="10" r="3.6" fill="#FFE000"/><path d="M10 8h4v3.2a2 2 0 0 1-4 0z" fill="#DA291C"/><path d="M10.8 8.8h2.4v2.2a1.2 1.2 0 0 1-2.4 0z" fill="#fff"/></svg>',
  en:'<svg viewBox="0 0 60 40" preserveAspectRatio="none"><rect width="60" height="40" fill="#012169"/><path d="M0 0L60 40M60 0L0 40" stroke="#fff" stroke-width="8"/><path d="M0 0L60 40M60 0L0 40" stroke="#C8102E" stroke-width="3"/><path d="M30 0V40M0 20H60" stroke="#fff" stroke-width="13"/><path d="M30 0V40M0 20H60" stroke="#C8102E" stroke-width="8"/></svg>',
  fr:'<svg viewBox="0 0 3 2" preserveAspectRatio="none"><rect width="1" height="2" fill="#0055A4"/><rect x="1" width="1" height="2" fill="#fff"/><rect x="2" width="1" height="2" fill="#EF4135"/></svg>',
  de:'<svg viewBox="0 0 3 2" preserveAspectRatio="none"><rect width="3" height=".67" fill="#000"/><rect y=".67" width="3" height=".67" fill="#DD0000"/><rect y="1.33" width="3" height=".67" fill="#FFCE00"/></svg>',
  es:'<svg viewBox="0 0 3 2" preserveAspectRatio="none"><rect width="3" height="2" fill="#AA151B"/><rect y=".5" width="3" height="1" fill="#F1BF00"/></svg>'
};
const IDX = {en:0, fr:1, de:2, es:3};
/* os dicionários começam vazios; js/traducoes.js preenche-os quando for preciso */
const DICT = {};
const CAT_I18N = {};
const MENU_I18N = {};
const META_DESC = {"pt":"Café Príncipe, em Brito (Guimarães): francesinhas, pregos, panados, hambúrgueres e muito mais. Encomendas por telefone para levantar no café e reservas de mesa."};
/* hora de abertura, estado e dias da semana (português; as outras línguas vêm de js/traducoes.js) */
const L_TXT = {
  pt:{"aberto":"Aberto agora, fecha às {h}","hoje":"Fechado agora, abre hoje às {h}","amanha":"Fechado agora, abre amanhã às {h}","dia":"Fechado agora, abre {d} às {h}","fechado":"Fechado","e":" e ","a":" a ","fer":"Feriados: {h}","fec":"Fechado a 25 de dezembro e 1 de janeiro"}
};
const DIAS = {"pt":["Dom","Seg","Ter","Qua","Qui","Sex","Sáb"]};
