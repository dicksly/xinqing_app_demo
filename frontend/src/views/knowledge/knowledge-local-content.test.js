import assert from 'node:assert/strict'
import {
  LOCAL_KNOWLEDGE_ARTICLES,
  getLocalKnowledgeArticleById,
  getLocalKnowledgeArticleBySourceUrl,
} from './knowledge-local-content.js'

const blockedArticleUrls = [
  'https://www.coreenergetics.org/grounding-techniques-in-body-psychotherapy-finding-stability-in-a-chaotic-world/?gad_source=1&gad_campaignid=22300250112&gbraid=0AAAAApJEfmbRutk_aShitAiikt90dveVl&gclid=CjwKCAjwuO_QBhAWEiwAIkVhU42KnmQ5UKI-9sx4_ji0aZYJ6lIjlcyv1Q2_1hcBn6LH-CHJXAXoIhoCFTIQAvD_BwE',
  'https://antiloneliness.com/post/how-to-build-meaningful-connections-with-others',
  'https://thinklessandgrowrich.medium.com/being-true-to-yourself-7-tips-to-live-a-more-authentic-life-6ae51f76b1e7',
  'https://www.in-mind.org/article/breathe-through-the-stress-simple-breathing-techniques-for-staying-calm-under-pressure?gad_source=1&gad_campaignid=343237259&gbraid=0AAAAADg-6I0qQcBN3BCCm0XwVhZ2ZmxZz&gclid=Cj0KCQjwio_RBhDMARIsAJPveNPe6eU6wW2d6GwXM2NbYX4M7ViQhyED6aWvLAjGv0jJ23RiaOmNVJsaAjd4EALw_wcB',
  'https://commonpurpose.org/resources/blog/tips-to-build-confidence?gad_source=1&gad_campaignid=22661182461&gbraid=0AAAAADmzJ0OYFFASi2-w5-bcuIpXAUy7F&gclid=Cj0KCQjwio_RBhDMARIsAJPveNMUbTIzOCdyKvF61wAAG62nMCYz7eJGNlJCkjc8RFj00TGOtGbJd0MaAiBBEALw_wcB',
  'https://eugenetherapy.com/article/4-tips-for-building-tolerance-for-others/',
  'https://www.6seconds.org/2025/07/01/the-power-of-gratitude-change-your-brain-and-life/',
]

assert.equal(LOCAL_KNOWLEDGE_ARTICLES.length, 7)

for (const sourceUrl of blockedArticleUrls) {
  const article = getLocalKnowledgeArticleBySourceUrl(sourceUrl)

  assert.ok(article, `Expected local article for ${sourceUrl}`)
  assert.equal(article.sourceUrl, sourceUrl)
  assert.ok(article.id, 'local article needs a stable id')
  assert.ok(article.title, 'local article needs a title')
  assert.ok(article.summary.length >= 40, 'local article needs a useful summary')
  assert.ok(article.sections.length >= 3, 'local article needs structured sections')
  assert.ok(article.practices.length >= 2, 'local article needs practice steps')
  assert.ok(article.reflectionPrompts.length >= 2, 'local article needs reflection prompts')
  assert.equal(getLocalKnowledgeArticleById(article.id), article)
}

assert.equal(
  getLocalKnowledgeArticleBySourceUrl('https://jamesclear.com/focus'),
  null
)

console.log('knowledge-local-content tests passed')
