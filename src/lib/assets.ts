// Vite fingerprints these unchanged media files so they can be cached immutably.
const assets = import.meta.glob('../assets/*', { eager: true, query: '?url', import: 'default' });
export function assetUrl(name: string): string {
 const url = assets[`../assets/${name}`];
 if (typeof url !== 'string') throw new Error(`Missing local asset: ${name}`);
 return url;
}
