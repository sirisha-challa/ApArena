const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync('data.json', 'utf-8'));

const typeMap = {
  'intro-analogies': 'concept',
  'word-analogies': 'concept',
  'letter-number-analogies': 'example',
  'pattern-recognition': 'guided',
  'company-patterns': 'practice',
  'shortcuts-speed': 'mastery',
  'intro-coding': 'concept',
  'letter-coding-types': 'concept',
  'number-coding': 'example',
  'advanced-coding': 'guided',
  'coding-tricks': 'practice',
  'common-mistakes': 'concept',
  'revision-coding': 'mastery'
};

const typeOrder = { concept: 0, example: 1, guided: 2, practice: 3, mastery: 4 };

const index = {
  categories: data.categories || [],
  topics: data.topics.map(t => ({
    id: t.id,
    title: t.title,
    icon: t.icon,
    category: t.category,
    color: t.color,
    days: t.days,
    subtopics: t.subtopics,
    estimatedHours: t.estimatedHours
  }))
};
fs.writeFileSync('data/topics.json', JSON.stringify(index, null, 2));

data.topics.forEach(topic => {
  const sections = topic.readingSections || [];
  sections.forEach(s => {
    if (!s.type) {
      s.type = typeMap[s.id] || 'concept';
    }
  });

  const path = sections.map(s => ({
    type: s.type || 'concept',
    sectionId: s.id
  }));
  topic.learningPath = path;

  fs.writeFileSync(`data/topics/${topic.id}.json`, JSON.stringify(topic, null, 2));
});

console.log('Migration complete.');
console.log(`Index: data/topics.json (${index.topics.length} topics, ${index.categories.length} categories)`);
data.topics.forEach(t => {
  const size = fs.statSync(`data/topics/${t.id}.json`).size;
  console.log(`  data/topics/${t.id}.json — ${(size / 1024).toFixed(1)} KB`);
});
