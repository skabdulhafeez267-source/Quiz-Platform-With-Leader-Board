require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Quiz = require('./models/Quiz');
const Result = require('./models/Result');

const seed = async () => {
  await connectDB();

  await User.deleteMany({});
  await Quiz.deleteMany({});
  await Result.deleteMany({});

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@quizapp.com',
    password: 'admin123',
    role: 'admin',
  });

  await User.create({
    name: 'Demo User',
    email: 'demo@quizapp.com',
    password: 'demo1234',
    role: 'user',
  });

  await Quiz.create({
    title: 'JavaScript Basics',
    description: 'Test your fundamental JavaScript knowledge',
    category: 'JavaScript',
    difficulty: 'easy',
    durationMinutes: 5,
    createdBy: admin._id,
    questions: [
      {
        questionText: "What does 'typeof []' return in JavaScript?",
        options: [{ text: 'array' }, { text: 'object' }, { text: 'list' }, { text: 'undefined' }],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'Which keyword declares a block-scoped variable?',
        options: [{ text: 'var' }, { text: 'let' }, { text: 'function' }, { text: 'global' }],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'What is the output of 2 + "2" in JavaScript?',
        options: [{ text: '4' }, { text: '22' }, { text: 'NaN' }, { text: 'Error' }],
        correctOptionIndex: 1,
        points: 10,
      },
    ],
  });

  await Quiz.create({
    title: 'React Fundamentals',
    description: 'Core concepts of React',
    category: 'React',
    difficulty: 'medium',
    durationMinutes: 8,
    createdBy: admin._id,
    questions: [
      {
        questionText: 'Which hook is used to manage state in a functional component?',
        options: [{ text: 'useEffect' }, { text: 'useState' }, { text: 'useRef' }, { text: 'useMemo' }],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'What does JSX stand for?',
        options: [
          { text: 'JavaScript XML' },
          { text: 'Java Syntax Extension' },
          { text: 'JSON XML' },
          { text: 'JavaScript Extension' },
        ],
        correctOptionIndex: 0,
        points: 10,
      },
      {
        questionText: 'Which method is used to render a React component to the DOM?',
        options: [
          { text: 'ReactDOM.render / createRoot' },
          { text: 'React.mount' },
          { text: 'DOM.append' },
          { text: 'render.React' },
        ],
        correctOptionIndex: 0,
        points: 10,
      },
    ],
  });

  await Quiz.create({
    title: 'Node.js & Express',
    description: 'Backend development with Node and Express',
    category: 'Backend',
    difficulty: 'medium',
    durationMinutes: 8,
    createdBy: admin._id,
    questions: [
      {
        questionText: 'Which module is used to create a server in Node.js?',
        options: [{ text: 'fs' }, { text: 'http' }, { text: 'path' }, { text: 'os' }],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'In Express, what does app.use() do?',
        options: [
          { text: 'Defines a route' },
          { text: 'Mounts middleware' },
          { text: 'Starts the server' },
          { text: 'Closes the connection' },
        ],
        correctOptionIndex: 1,
        points: 10,
      },
      {
        questionText: 'Which HTTP status code indicates a resource was successfully created?',
        options: [{ text: '200' }, { text: '201' }, { text: '404' }, { text: '500' }],
        correctOptionIndex: 1,
        points: 10,
      },
    ],
  });

  console.log('Seed data inserted successfully');
  console.log('Admin login: admin@quizapp.com / admin123');
  console.log('Demo login: demo@quizapp.com / demo1234');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
