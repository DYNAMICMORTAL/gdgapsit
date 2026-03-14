import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'event';
  eventData?: {
    startDate: string;
    endDate?: string;
    location: string;
    organizer: string;
  };
}

export const SEOHead = ({
  title = 'GDG on Campus APSIT',
  description = 'Google Developer Groups on Campus at A.P. Shah Institute of Technology, Thane. Study Jams, Hackathons, Workshops & more.',
  image,
  url,
  type = 'website',
  eventData,
}: SEOProps) => {
  const fullTitle = title === 'GDG on Campus APSIT' ? title : `${title} | GDG on Campus APSIT`;
  const fullUrl = url || (typeof window !== 'undefined' ? window.location.href : '');

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content="GDG, Google Developer Groups, APSIT, Thane, hackathon, flutter, machine learning, study jams, workshop" />
      <meta name="author" content="GDG on Campus APSIT" />
      <link rel="canonical" href={fullUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      <meta property="og:url" content={fullUrl} />
      <meta property="og:site_name" content="GDG on Campus APSIT" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}

      {eventData && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Event",
            "name": title,
            "description": description,
            "startDate": eventData.startDate,
            "endDate": eventData.endDate || eventData.startDate,
            "eventStatus": "https://schema.org/EventScheduled",
            "location": {
              "@type": "Place",
              "name": eventData.location,
              "address": { "@type": "PostalAddress", "addressLocality": "Thane", "addressCountry": "IN" }
            },
            "organizer": {
              "@type": "Organization",
              "name": "GDG on Campus APSIT",
            }
          })}
        </script>
      )}
    </Helmet>
  );
};
