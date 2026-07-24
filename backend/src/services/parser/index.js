import * as cheerio from 'cheerio';

export function parseHtml(html) {
  const $ = cheerio.load(html);

  const pageTitle = $('title').first().text().trim() || null;
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() || null;
  const h1Count = $('h1').length;

  let imagesMissingAlt = 0;
  $('img').each((_, el) => {
    const alt = $(el).attr('alt');
    if (alt === undefined || alt.trim() === '') {
      imagesMissingAlt += 1;
    }
  });

  $('script, style, noscript').remove();
  const bodyText = $('body').text().trim();
  const approximateWordCount = bodyText === '' ? 0 : bodyText.split(/\s+/).length;

  return {
    page_title: pageTitle,
    meta_description: metaDescription,
    h1_count: h1Count,
    images_missing_alt: imagesMissingAlt,
    approximate_word_count: approximateWordCount,
  };
}
