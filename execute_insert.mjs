import { getDb } from './server/db.ts';
import fs from 'fs';

async function insertPoems() {
  const db = await getDb();
  if (!db) {
    console.error('数据库连接失败');
    process.exit(1);
  }

  try {
    // 读取SQL文件
    const sqlContent = fs.readFileSync('./insert_poems.sql', 'utf-8');
    const statements = sqlContent.split(';\n').filter(s => s.trim());

    console.log(`准备执行${statements.length}条SQL语句...`);

    // 由于Drizzle ORM不直接支持原始SQL执行，我们需要使用另一种方法
    // 这里我们使用drizzle的raw方法或者直接使用数据库连接

    console.log('注意：需要使用数据库客户端直接执行SQL');
    console.log('SQL文件已生成: insert_poems.sql');
    
    process.exit(0);
  } catch (error) {
    console.error('错误:', error);
    process.exit(1);
  }
}

insertPoems();
