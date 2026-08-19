/**
 * Redução de imagem no cliente, antes do upload.
 *
 * Câmera de celular gera JPEG de 3 a 8 MB e o bucket recusa acima de 5 MB — em
 * campo a pessoa ficava sem saída. Reduzir aqui resolve o limite e, de quebra,
 * corta o tempo de upload em rede fraca, que é o segundo maior atrito.
 */

/** Lado maior da imagem enviada: legível pra conferir um RG e o estado do rádio. */
export const LADO_MAX = 1600;

const QUALIDADE = 0.85;

/** Abaixo disso não compensa re-encodar: já cabe, e perderia nitidez à toa. */
const SEM_MEXER_BYTES = 600 * 1024;

type Fonte = {
  src: CanvasImageSource;
  width: number;
  height: number;
  liberar: () => void;
};

export async function reduzirImagem(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;

  let fonte: Fonte | null = null;
  try {
    fonte = await carregar(file);
    const escala = Math.min(1, LADO_MAX / Math.max(fonte.width, fonte.height));

    // Já é pequena e leve: manda o original, sem perda de geração.
    if (escala === 1 && file.size <= SEM_MEXER_BYTES) return file;

    const largura = Math.round(fonte.width * escala);
    const altura = Math.round(fonte.height * escala);

    const canvas = document.createElement("canvas");
    canvas.width = largura;
    canvas.height = altura;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    // JPEG não tem canal alfa; sem esse fundo, PNG transparente vira preto.
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, largura, altura);
    ctx.drawImage(fonte.src, 0, 0, largura, altura);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", QUALIDADE),
    );

    // Se não encolheu (imagem já otimizada), fica com o original.
    if (!blob || blob.size >= file.size) return file;

    return new File([blob], trocarParaJpg(file.name), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    // Falhou reduzir? Segue com o original — servidor ainda valida tipo e tamanho.
    return file;
  } finally {
    fonte?.liberar();
  }
}

async function carregar(file: File): Promise<Fonte> {
  if (typeof createImageBitmap === "function") {
    // `from-image` aplica a orientação do EXIF. Sem isso, foto tirada com o
    // celular deitado é gravada deitada.
    const bmp = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    return {
      src: bmp,
      width: bmp.width,
      height: bmp.height,
      liberar: () => bmp.close(),
    };
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("não foi possível abrir a imagem"));
      el.src = url;
    });
    return {
      src: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      liberar: () => URL.revokeObjectURL(url),
    };
  } catch (e) {
    URL.revokeObjectURL(url);
    throw e;
  }
}

function trocarParaJpg(nome: string) {
  return nome.replace(/\.[^./\\]+$/, "") + ".jpg";
}
