import { imagemDoSelo } from "@/lib/badge-image";
import { seloDeExemplo } from "@/lib/site";

export const alt = "Selo Vizinho de Alta Tensão (exemplo)";
export const size = { width: 1080, height: 1080 };
export const contentType = "image/png";

export default async function Image() {
  return imagemDoSelo(await seloDeExemplo(), "square");
}
