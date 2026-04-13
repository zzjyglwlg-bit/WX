import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate, useLocation } from 'react-router-dom';

// 导航栏组件
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          高中现代文练习
        </Link>
        <ul className="navbar-menu">
          <li><Link to="/">首页</Link></li>
          <li><Link to="/categories">专题分类</Link></li>
          <li><Link to="/practice">开始练习</Link></li>
          <li><Link to="/about">关于我们</Link></li>
        </ul>
      </div>
    </nav>
  );
};

// 英雄区域组件
const HeroSection = () => {
  return (
    <section className="hero-section">
      <h1 className="hero-title">高中现代文练习平台</h1>
      <p className="hero-subtitle">通过专题分类，提升现代文阅读与写作能力</p>
      <div className="hero-buttons">
        <Link to="/categories" className="button button-primary">
          浏览专题
        </Link>
        <Link to="/practice" className="button button-secondary">
          开始练习
        </Link>
      </div>
    </section>
  );
};

// 专题分类组件
const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        // 确保data是数组
        if (Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.error('获取分类失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/practice?category=${categoryId}`);
  };

  if (loading) {
    return (
      <section className="categories-section">
        <h2 className="section-title">专题分类</h2>
        <div className="categories-grid">
          <div className="category-card">
            <div className="category-icon">⏳</div>
            <h3 className="category-title">加载中...</h3>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="categories-section">
      <h2 className="section-title">专题分类</h2>
      <div className="categories-grid">
        {categories.map(category => (
          <div 
            key={category.id} 
            className="category-card"
            onClick={() => handleCategoryClick(category.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="category-icon">{category.icon}</div>
            <h3 className="category-title">{category.title}</h3>
            <p className="category-description">{category.description}</p>
            <div style={{ marginTop: '15px' }}>
              <span className="button button-secondary" style={{ fontSize: '14px', padding: '8px 16px' }}>
                查看题目
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// 练习组件
const PracticeSection = () => {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question_id: 1, // 暂时使用固定题目ID
          content: answer
        })
      });
      const data = await response.json();
      if (data.success) {
        setFeedback(data.feedback);
        setAnswer('');
      }
    } catch (error) {
      console.error('提交答案失败:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="practice-section">
      <div className="practice-container">
        <h2 className="practice-title">现代文练习</h2>
        <div className="practice-content">
          <p className="practice-question">
            阅读下面的文字，根据要求作文。
            <br /><br />
            有人说，生活是一面镜子，你对它笑，它就对你笑；你对它哭，它就对你哭。
            <br /><br />
            请以"心态与生活"为话题，写一篇不少于800字的议论文。
          </p>
          <form onSubmit={handleSubmit}>
            <textarea
              className="practice-input"
              placeholder="请在此输入你的作文..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            ></textarea>
            <div className="practice-submit">
              <button 
                type="submit" 
                className="button button-primary"
                disabled={loading}
              >
                {loading ? '提交中...' : '提交作文'}
              </button>
            </div>
          </form>
        </div>
        
        {feedback && (
          <div className="practice-content" style={{ marginTop: '20px' }}>
            <h3 style={{ marginBottom: '15px' }}>作文批阅结果</h3>
            <div style={{ whiteSpace: 'pre-line' }}>{feedback}</div>
          </div>
        )}
      </div>
    </section>
  );
};

// 页脚组件
const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <p className="footer-text">
          © 2026 高中现代文练习平台 | 基于Apple.com风格设计
        </p>
      </div>
    </footer>
  );
};

// 首页组件
const Home = () => {
  return (
    <div className="main-content">
      <HeroSection />
      <CategoriesSection />
    </div>
  );
};

// 分类页面组件
const Categories = () => {
  return (
    <div className="main-content">
      <CategoriesSection />
    </div>
  );
};

// 题目详情组件
const QuestionDetail = () => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  
  const { id } = useParams();

  useEffect(() => {
    const fetchQuestion = async () => {
      try {
        const response = await fetch(`/api/questions/${id}`);
        const data = await response.json();
        setQuestion(data);
      } catch (error) {
        console.error('获取题目失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestion();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!answer.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/submit-answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question_id: id,
          content: answer
        })
      });
      const data = await response.json();
      if (data.success) {
        setFeedback(data.feedback);
        setAnswer('');
      }
    } catch (error) {
      console.error('提交答案失败:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <section className="practice-section">
          <div className="practice-container">
            <h2 className="practice-title">加载中...</h2>
          </div>
        </section>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="main-content">
        <section className="practice-section">
          <div className="practice-container">
            <h2 className="practice-title">题目不存在</h2>
          </div>
        </section>
      </div>
    );
  }

  const questionData = JSON.parse(question.content);

  return (
    <div className="main-content">
      <section className="practice-section">
        <div className="practice-container">
          <h2 className="practice-title">{question.title}</h2>
          
          {questionData.article && (
            <div className="practice-content" style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '15px' }}>文章内容</h3>
              <div style={{ whiteSpace: 'pre-line' }}>{questionData.article}</div>
            </div>
          )}
          
          <div className="practice-content">
            <p className="practice-question">{questionData.question.题目}</p>
            <form onSubmit={handleSubmit}>
              <textarea
                className="practice-input"
                placeholder="请在此输入你的答案..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
              ></textarea>
              <div className="practice-submit">
                <button 
                  type="submit" 
                  className="button button-primary"
                  disabled={submitting}
                >
                  {submitting ? '提交中...' : '提交答案'}
                </button>
              </div>
            </form>
          </div>
          
          {feedback && (
            <div className="practice-content" style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '15px' }}>批改结果</h3>
              <div style={{ whiteSpace: 'pre-line' }}>{feedback}</div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

// 练习页面组件
const Practice = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const urlParams = new URLSearchParams(location.search);
        const categoryId = urlParams.get('category');
        
        let apiUrl = '/api/questions';
        if (categoryId) {
          apiUrl = `/api/questions/category/${categoryId}`;
        }
        
        const response = await fetch(apiUrl);
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error('获取题目失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [location.search]);

  if (loading) {
    return (
      <div className="main-content">
        <section className="practice-section">
          <div className="practice-container">
            <h2 className="practice-title">加载中...</h2>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="main-content">
      <section className="practice-section">
        <div className="practice-container">
          <h2 className="practice-title">现代文练习</h2>
          <div className="categories-grid">
            {questions.map(q => {
              const questionData = JSON.parse(q.content);
              return (
                <div key={q.id} className="category-card">
                  <div className="category-icon">📝</div>
                  <h3 className="category-title">{q.title}</h3>
                  <p className="category-description">{questionData.question.题型} · {questionData.question.分值}</p>
                  <Link to={`/question/${q.id}`} className="button button-primary" style={{ marginTop: '20px', display: 'inline-block' }}>
                    开始练习
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

// 关于页面组件
const About = () => {
  return (
    <div className="main-content">
      <section className="hero-section">
        <h1 className="hero-title">关于我们</h1>
        <p className="hero-subtitle">
          高中现代文练习平台致力于帮助学生提高现代文阅读和写作能力，
          通过专题分类和智能批改，让学习更加高效。
        </p>
      </section>
    </div>
  );
};

// 主App组件
function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/practice" element={<Practice />} />
        <Route path="/question/:id" element={<QuestionDetail />} />
        <Route path="/about" element={<About />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
