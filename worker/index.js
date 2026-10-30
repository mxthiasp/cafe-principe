/* Café Príncipe: etiquetas de partilha por prato.
   Quando alguém partilha /prato/francesinha-especial no WhatsApp ou no Facebook, esses serviços não correm o código do site:
   só leem o HTML. Este pequeno programa corre apenas nos endereços /prato/... e troca o título, a descrição e a foto
   que aparecem na pré-visualização pelos do prato. O resto do site é servido normalmente. */
import PRATOS from "./pratos.json";

const euro = n => n > 0 ? n.toFixed(2).replace(".", ",") + " €" : "";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const m = url.pathname.match(/^\/prato\/([a-z0-9-]+)\/?$/);
    // a página do site é sempre a mesma; o navegador mostra o prato certo a partir do endereço
    const pagina = await env.ASSETS.fetch(new Request(new URL("/", url).toString()));
    const p = m && PRATOS[m[1]];
    if (!p) return pagina;

    const titulo = p.nome + " · Café Príncipe";
    const desc = (p.desc + (p.preco > 0 ? " " + euro(p.preco) + "." : "")).trim();
    const imagem = new URL(p.img, url.origin).toString();
    const endereco = new URL("/prato/" + m[1], url.origin).toString();
    const meta = (atributo, valor, conteudo) => ({ element: e => { if (e.getAttribute(atributo) === valor) e.setAttribute("content", conteudo); } });

    return new HTMLRewriter()
      .on("title", { element: e => e.setInnerContent(titulo) })
      .on("meta", meta("property", "og:title", titulo))
      .on("meta", meta("property", "og:description", desc))
      .on("meta", meta("property", "og:image", imagem))
      .on("meta", meta("property", "og:url", endereco))
      .on("meta", meta("name", "description", p.nome + ". " + desc))
      .on("meta", meta("name", "twitter:title", titulo))
      .on("meta", meta("name", "twitter:description", desc))
      .on("meta", meta("name", "twitter:image", imagem))
      .transform(new Response(pagina.body, pagina));
  }
};
