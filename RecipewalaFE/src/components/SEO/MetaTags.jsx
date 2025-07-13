import { Helmet } from 'react-helmet-async'

const MetaTags = ({ 
  title = "RecipeWala - AI-Powered Recipe Generator | Create Amazing Meals",
  description = "Transform your cooking with AI-generated recipes. Get personalized recipes, smart meal planning, and cooking insights. Start free!",
  keywords = "AI recipes, recipe generator, meal planning, cooking app, personalized recipes, food AI",
  image = "/og-image.png",
  url = "https://recipewala.com"
}) => {
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="RecipeWala Team" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="RecipeWala" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />
      
      {/* Additional SEO Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <link rel="canonical" href={url} />
      
      {/* Schema.org structured data */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "RecipeWala",
            "url": "${url}",
            "description": "${description}",
            "applicationCategory": "LifestyleApplication",
            "operatingSystem": "Web, iOS, Android",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "creator": {
              "@type": "Organization",
              "name": "RecipeWala Team"
            }
          }
        `}
      </script>
    </Helmet>
  )
}

export default MetaTags