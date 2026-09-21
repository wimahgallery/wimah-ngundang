import ImageKit from "@imagekit/nodejs";

let _client: ImageKit | null = null;

function getClient(): ImageKit {
  if (!_client) {
    _client = new ImageKit({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    });
  }
  return _client;
}

export async function uploadFile(
  file: Buffer,
  fileName: string,
  mimeType = "image/jpeg",
  folder = "invitations",
) {
  const client = getClient();
  const base64 = file.toString("base64");
  const dataUrl = `data:${mimeType};base64,${base64}`;

  const response = await client.files.upload({
    file: dataUrl,
    fileName,
    folder,
    useUniqueFileName: true,
  });

  return {
    url: response.url,
    fileId: response.fileId,
    name: response.name,
  };
}
