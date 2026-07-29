export function debounce<T extends (...args: any[]) => void>(fn: T, delay: number) { let t: any; return (...args: any[]) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); }; }
