"use client";

import Head from 'next/head';
import { useEffect, useState } from 'react';
import { createClient } from '../../supabase/client';

interface SEOHeadProps {
  pagePath: string;
  defaultTitle?: string;
  defaultDescription?: string;
}

export function SEOHead({ 
  pagePath, 
  defaultTitle = 'NavyGoal',
  defaultDescription = 'Achieve your goals with AI-powered tracking'
}: SEOHeadProps) {
  const [seoData, setSeoData] = useState<any>(null);
  const supabase = createClient();

  useEffect(() => {
    loadSEOData();
  }, [pagePath]);

  const loadSEOData = async () => {
    const { data } = await supabase
      .from('seo_settings')
      .select('*')
      .eq('page_path', pagePath)
      .single();

    if (data) {
      setSeoData(data);
    }
  };

  const title = seoData?.title || defaultTitle;
  const description = seoData?.description || defaultDescription;
  const ogTitle = seoData?.og_title || title;
  const ogDescription = seoData?.og_description || description;
  const ogImage = seoData?.og_image || '/og-image.jpg';
  const twitterCard = seoData?.twitter_card || 'summary_large_image';
  const robots = seoData?.robots || 'index, follow';
  const canonicalUrl = seoData?.canonical_url || `https://navygoal.com${pagePath}`;
  const keywords = seoData?.keywords?.join(', ') || '';

  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />

      {/* Twitter Card */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured Data */}
      {seoData?.structured_data && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(seoData.structured_data),
          }}
        />
      )}
    </Head>
  );
}
