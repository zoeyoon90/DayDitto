export function isTossWebView(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent;
  return ua.includes('TossApp') || ua.includes('Toss');
}
