export function paginateText(text: string, maxChars: number) {
  const words = text.split(/\s+/).filter(Boolean);
  const pages: string[] = [];
  let current = '';
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      pages.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) pages.push(current);
  return pages;
}
