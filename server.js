import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 5001;

// 中间件
app.use(cors());
app.use(express.json());

// DeepSeek API配置
const DEEPSEEK_API_KEY = 'your_deepseek_api_key'; // 替换为实际的API密钥
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// 初始化localStorage数据
function initLocalStorageData() {
  // 读取题目数据
  const jsonPath = path.join(process.cwd(), 'article', '题目&评分细则.json');
  const jsonData = fs.readFileSync(jsonPath, 'utf8');
  const questionsData = JSON.parse(jsonData);
  
  // 提取题目类型作为分类
  const categoryMap = new Map();
  const icons = ['📝', '📖', '📚', '🎭', '✍️', '🔍', '💡', '�'];
  
  questionsData.forEach(q => {
    if (!categoryMap.has(q.题型)) {
      categoryMap.set(q.题型, {
        id: categoryMap.size + 1,
        title: q.题型,
        description: `包含${q.题型}类型的题目`,
        icon: icons[categoryMap.size % icons.length]
      });
    }
  });
  
  // 转换为数组
  const categories = Array.from(categoryMap.values());
  
  // 构建题目数据
  const questions = questionsData.map((q, index) => {
    // 查找对应的文章文件
    const articlePath = path.join(process.cwd(), 'article', `${q.出处.replace(/.*《(.*)》/, '$1')}.txt`);
    let articleContent = '';
    
    if (fs.existsSync(articlePath)) {
      articleContent = fs.readFileSync(articlePath, 'utf8');
    }
    
    // 查找对应的分类ID
    const category = categories.find(cat => cat.title === q.题型);
    const categoryId = category ? category.id : 1;
    
    return {
      id: index + 1,
      category_id: categoryId,
      title: q.题目,
      content: JSON.stringify({ question: q, article: articleContent }),
      type: 'reading',
      difficulty: 'medium'
    };
  });
  
  return { categories, questions };
}

// 全局数据存储
let appData = initLocalStorageData();
console.log('数据初始化完成，共加载', appData.questions.length, '道题目');


// API路由

// 获取所有专题分类
app.get('/api/categories', (req, res) => {
  res.json(appData.categories);
});

// 获取练习题目
app.get('/api/questions', (req, res) => {
  res.json(appData.questions);
});

// 根据分类获取题目
app.get('/api/questions/category/:categoryId', (req, res) => {
  const { categoryId } = req.params;
  const questions = appData.questions.filter(q => q.category_id === parseInt(categoryId));
  res.json(questions);
});

// 获取单个题目详情
app.get('/api/questions/:id', (req, res) => {
  const { id } = req.params;
  const question = appData.questions.find(q => q.id === parseInt(id));
  if (question) {
    res.json(question);
  } else {
    res.status(404).json({ error: '题目不存在' });
  }
});

// 提交答案
app.post('/api/submit-answer', async (req, res) => {
  try {
    const { question_id, content } = req.body;
    
    // 调用DeepSeek API进行作文批阅
    const feedback = await evaluateEssay(content);
    
    res.json({ success: true, answer_id: Date.now(), feedback: feedback });
  } catch (error) {
    res.status(500).json({ error: '提交答案失败' });
  }
});

// DeepSeek API作文批阅函数
async function evaluateEssay(content) {
  try {
    const response = await axios.post(
      DEEPSEEK_API_URL,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位高中语文老师，负责批改学生的作文。请对以下作文进行详细的批改，包括：1. 评分（0-100分）2. 优点分析 3. 改进建议 4. 总体评价。请使用专业、客观的语言。'
          },
          {
            role: 'user',
            content: content
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
        }
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API调用失败:', error);
    return '作文批阅服务暂时不可用，请稍后再试。';
  }
}

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
