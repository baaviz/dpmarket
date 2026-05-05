import type { MetadataRoute } from 'next';
import { clientEnv } from '@/lib/env';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = clientEnv.NEXT_PUBLIC_SITE_URL;

  return [
    { url: `${siteUrl}/ar`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/en`, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${siteUrl}/ar/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/en/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${siteUrl}/ar/orders`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    { url: `${siteUrl}/en/orders`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
  ];
}
