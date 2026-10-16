import { toast } from "sonner";
import { selo as textos } from "@/content/site";

/** Web Share API com alternativa de copiar o link. */
export async function compartilharLink(url: string) {
  const dados = { title: textos.compartilharTitulo, text: textos.compartilharTexto, url };
  try {
    if (navigator.share && (!navigator.canShare || navigator.canShare(dados))) {
      await navigator.share(dados);
      return;
    }
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") return;
  }
  try {
    await navigator.clipboard.writeText(`${dados.text} ${url}`);
    toast.success(textos.linkCopiado);
  } catch {
    toast(textos.copiaFalhou, { description: url, duration: 10_000 });
  }
}
