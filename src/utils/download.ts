function getFilenameFromDisposition(value: string | null) {
  if (!value) {
    return null;
  }

  const utf8Match = /filename\*=UTF-8''([^;]+)/i.exec(value);
  if (utf8Match?.[1]) {
    return decodeURIComponent(utf8Match[1]);
  }

  const basicMatch = /filename="?([^"]+)"?/i.exec(value);
  return basicMatch?.[1] ?? null;
}

export async function downloadFile(url: string) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Download failed with status ${response.status}`);
  }

  const blob = await response.blob();
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  const filename = getFilenameFromDisposition(response.headers.get("content-disposition"));

  link.href = objectUrl;
  link.download = filename ?? "";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);
}
