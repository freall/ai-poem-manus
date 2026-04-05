import { getDb, getAllPoems } from './server/db.ts';
import { poems, questions } from './drizzle/schema.ts';
import fs from 'fs';
import path from 'path';

async function seedDatabase() {
  try {
    const db = await getDb();
    if (!db) {
      console.error('Failed to connect to database');
      process.exit(1);
    }

    // 读取诗词数据
    const poemsData = JSON.parse(fs.readFileSync('./poems_data.json', 'utf-8'));
    const imageUrls = JSON.parse(fs.readFileSync('./poem_image_urls.json', 'utf-8'));
    const poemDetails = JSON.parse(fs.readFileSync('./poem_details.json', 'utf-8'));
    const poemQuestions = JSON.parse(fs.readFileSync('./poem_questions.json', 'utf-8'));

    console.log('开始导入诗词数据...');

    // 插入诗词
    for (const poem of poemsData) {
      const detail = poemDetails.find(d => d.id === poem.id);
      const imageUrl = imageUrls[poem.id] || '';
      const category = poem.season ? '节气' : '节日';

      await db.insert(poems).values({
        id: poem.id,
        title: poem.title,
        author: poem.author,
        dynasty: poem.dynasty,
        content: poem.content,
        translation: detail?.translation || '',
        background: detail?.background || '',
        imageUrl: imageUrl,
        category: category,
        season: poem.season || '',
        festival: poem.festival || '',
      });
    }

    console.log(`✓ 已导入 ${poemsData.length} 首诗词`);

    // 插入问题
    let questionCount = 0;
    for (const poemQ of poemQuestions) {
      for (let idx = 0; idx < poemQ.questions.length; idx++) {
        const q = poemQ.questions[idx];
        const options = [q.a, `选项${idx + 1}`, `选项${idx + 2}`, `选项${idx + 3}`];

        await db.insert(questions).values({
          poemId: poemQ.poemId,
          question: q.q,
          correctAnswer: q.a,
          explanation: q.exp,
          options: options,
          questionIndex: idx,
        });
        questionCount++;
      }
    }

    console.log(`✓ 已导入 ${questionCount} 个问题`);
    console.log('✓ 数据库初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
}

seedDatabase();
