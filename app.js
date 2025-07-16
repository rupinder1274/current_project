// const express = require('express');
// const session = require('express-session');
// const csrf = require('csurf');
// const bcrypt = require('bcryptjs');
// const bodyParser = require('body-parser');
// const path = require('path');
// const multer = require('multer');
// const xlsx = require('xlsx');
// const fs = require('fs');
// const { v4: uuidv4 } = require('uuid');
// const cookieParser = require('cookie-parser');
// const mongoose = require('mongoose');
// const Employee = require('./models/Employee'); // after other require statements


// mongoose.connect('mongodb://127.0.0.1:27017/hrms-app', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log('✅ MongoDB connected'))
// .catch(err => console.error('❌ MongoDB error:', err));


// const app = express();
// const port = 3000;

// // In-memory employee storage
// //let employees = [];

// // Dummy Users
// const users = [
//   {
//     email: 'admin@cbsl.com',
//     password: bcrypt.hashSync('admin123', 10),
//     role: 'admin'
//   },
//   {
//     email: 'manager.DIH@cbsl.com',
//     password: bcrypt.hashSync('123', 10),
//     role: 'manager'
//   }
// ];

// // Multer setup
// const upload = multer({ dest: 'uploads/' });

// // EJS setup
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

// // Middleware
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());

// // Session setup
// app.use(session({
//   secret: 'mySecretKey',
//   resave: false,
//   saveUninitialized: true,
//   cookie: {
//     secure: false, // Set to true in production with HTTPS
//     httpOnly: true,
//     sameSite: 'strict'
//   }
// }));

// // CSRF protection middleware (session-based)
// const csrfProtection = csrf({ cookie: false });

// // CSRF error handler
// app.use((err, req, res, next) => {
//   if (err.code === 'EBADCSRFTOKEN') {
//     console.log('CSRF Token Error:', {
//       received: req.body._csrf,
//       session: req.session.csrfSecret
//     });
//     return res.status(403).send('Invalid CSRF token');
//   }
//   next(err);
// });

// // Authentication middleware
// function isAuth(req, res, next) {
//   if (req.session.user) return next();
//   res.redirect('/login');
// }

// function isAdmin(req, res, next) {
//   if (req.session.user && req.session.user.role === 'admin') return next();
//   res.status(403).send('Access Denied');
// }

// // Routes

// // Login GET
// app.get('/login', csrfProtection, (req, res) => {
//   res.render('login', {
//     title: 'Login',
//     messages: [],
//     hasErrors: false,
//     csrfToken: req.csrfToken()
//   });
// });

// // Login POST
// app.post('/login', csrfProtection, async (req, res) => {
//   const { email, password } = req.body;
//   const user = users.find(u => u.email === email);

//   if (!user || !(await bcrypt.compare(password, user.password))) {
//     return res.render('login', {
//       title: 'Login',
//       messages: ['Invalid credentials'],
//       hasErrors: true,
//       csrfToken: req.csrfToken()
//     });
//   }

//   req.session.user = user;

//   if (user.role === 'manager') return res.redirect('/dashboard/manager');
//   if (user.role === 'admin') return res.redirect('/dashboard/admin');
//   return res.status(403).send('Unauthorized role');
// });

// // Manager Dashboard
// app.get('/dashboard/manager', isAuth, (req, res) => {
//   res.send('Project Manager Dashboard 📋');
// });

// // Admin Dashboard
// app.get('/dashboard/admin', isAuth, isAdmin, csrfProtection, async (req, res) => {
//   try {
//     const employees = await Employee.find(); // Fetch from MongoDB
//     res.render('admin-dashboard', {
//       employees,
//       csrfToken: req.csrfToken()
//     });
//   } catch (err) {
//     console.error('Error fetching employees:', err);
//     res.status(500).send('Error loading dashboard.');
//   }
// });

// // Upload Employees Form
// app.get('/upload-employees', isAuth, isAdmin, csrfProtection, (req, res) => {
//   res.render('upload-employees', {
//     csrfToken: req.csrfToken()
//   });
// });

// // Upload Employees POST

// app.post(
//   '/upload-employees',
//   isAuth,
//   isAdmin,
//   upload.single('excelfile'),
//   csrfProtection,
//   async (req, res) => {
//     const filePath = req.file.path;
//     try {
//       const workbook = xlsx.readFile(filePath);
//       const sheetName = workbook.SheetNames[0];
//       const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

//       // Loop through Excel rows and save to MongoDB
//       for (const emp of data) {
//         if (emp['Emp. Code'] && emp['Resource Name']) {
//           await Employee.findOneAndUpdate(
//             { empCode: emp['Emp. Code'] }, // Filter by empCode
//             {
//               empCode: emp['Emp. Code'],
//               name: emp['Resource Name'],
//               payrollCompany: emp['Payroll Company'],
//               division: emp['Division'],
//               location: emp['Location'],
//               designation: emp['Designation'],
//               homePractice: emp['Home Practice'],
//               practiceManager: emp['Practice Manager'],
//               project: '' // Default empty
//             },
//             { upsert: true, new: true }
//           );
//         }
//       }

//       fs.unlinkSync(filePath);
//       res.redirect('/dashboard/admin');
//     } catch (err) {
//       console.error('Excel Parse Error:', err);
//       res.status(500).send('Error processing file.');
//     }
//   }
// );


// // Edit Employee GET
// app.get('/employees/:id/edit', isAuth, isAdmin, csrfProtection, async (req, res) => {
//   try {
//     const employee = await Employee.findOne({ empCode: req.params.id });
//     if (!employee) return res.status(404).send('Employee not found');
//     res.render('edit-employee', {
//       employee,
//       csrfToken: req.csrfToken()
//     });
//   } catch (err) {
//     console.error('Edit GET Error:', err);
//     res.status(500).send('Server error');
//   }
// });


// // Edit Employee POST
// app.post('/employees/:id/edit', isAuth, isAdmin, csrfProtection, async (req, res) => {
//   try {
//     await Employee.findOneAndUpdate(
//       { empCode: req.params.id },
//       {
//         empCode: req.body.empCode,
//         name: req.body.name,
//         payrollCompany: req.body.payrollCompany,
//         division: req.body.division,
//         location: req.body.location,
//         designation: req.body.designation,
//         homePractice: req.body.homePractice,
//         practiceManager: req.body.practiceManager
//       }
//     );
//     res.redirect('/dashboard/admin');
//   } catch (err) {
//     console.error('Edit POST Error:', err);
//     res.status(500).send('Error updating employee');
//   }
// });



// // Delete Employee POST
// app.post('/employees/:id/delete', isAuth, isAdmin, csrfProtection, async (req, res) => {
//   await Employee.deleteOne({ empCode: req.params.id });
//   res.redirect('/dashboard/admin');
// });

// app.get('/employees/:id/assign-project', isAuth, isAdmin, csrfProtection, async (req, res) => {
//   const employee = await Employee.findOne({ empCode: req.params.id });
//   if (!employee) return res.status(404).send('Employee not found');
//   res.render('assign-project', { employee, csrfToken: req.csrfToken() });
// });

// app.post('/employees/:id/assign-project', isAuth, isAdmin, csrfProtection, async (req, res) => {
//   await Employee.findOneAndUpdate(
//     { empCode: req.params.id },
//     { project: req.body.project }
//   );
//   res.redirect('/dashboard/admin');
// });


// // Logout
// app.get('/logout', (req, res) => {
//   req.session.destroy(() => {
//     res.redirect('/login');
//   });
// });

// // Start server
// app.listen(port, () => {
//   console.log(`🚀 Server running at http://localhost:${port}`);
// });






const express = require('express');
const session = require('express-session');
const csrf = require('csurf');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const Employee = require('./models/Employee'); // employee model

mongoose.connect('mongodb://127.0.0.1:27017/hrms-app', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB error:', err));

const app = express();
const port = 3000;

// Dummy Users
const users = [
  {
    email: 'admin@cbsl.com',
    password: bcrypt.hashSync('admin123', 10),
    role: 'admin'
  },
  {
    email: 'manager.DIH@cbsl.com',
    password: bcrypt.hashSync('123', 10),
    role: 'manager'
  }
];

// Multer setup for file uploads
const upload = multer({ dest: 'uploads/' });

// EJS setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Session
app.use(session({
  secret: 'mySecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false, // change to true in production with HTTPS
    httpOnly: true,
    sameSite: 'strict'
  }
}));

// CSRF protection
const csrfProtection = csrf({ cookie: false });

// CSRF error handler
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    console.log('CSRF Token Error:', {
      received: req.body._csrf,
      session: req.session.csrfSecret
    });
    return res.status(403).send('Invalid CSRF token');
  }
  next(err);
});

// Auth middleware
function isAuth(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') return next();
  res.status(403).send('Access Denied');
}

// Routes

// Login GET
app.get('/login', csrfProtection, (req, res) => {
  res.render('login', {
    title: 'Login',
    messages: [],
    hasErrors: false,
    csrfToken: req.csrfToken()
  });
});

// Login POST
app.post('/login', csrfProtection, async (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.render('login', {
      title: 'Login',
      messages: ['Invalid credentials'],
      hasErrors: true,
      csrfToken: req.csrfToken()
    });
  }

  req.session.user = user;

  if (user.role === 'manager') return res.redirect('/dashboard/manager');
  if (user.role === 'admin') return res.redirect('/dashboard/admin');
  return res.status(403).send('Unauthorized role');
});

// Manager Dashboard
app.get('/dashboard/manager', isAuth, (req, res) => {
  res.send('Project Manager Dashboard 📋');
});

// Admin Dashboard
app.get('/dashboard/admin', isAuth, isAdmin, csrfProtection, async (req, res) => {
  try {
    const employees = await Employee.find();
    res.render('admin-dashboard', {
      employees,
      csrfToken: req.csrfToken()
    });
  } catch (err) {
    console.error('Error fetching employees:', err);
    res.status(500).send('Error loading dashboard.');
  }
});

// Upload Employees Form
app.get('/upload-employees', isAuth, isAdmin, csrfProtection, (req, res) => {
  res.render('upload-employees', { csrfToken: req.csrfToken() });
});

// Upload Employees POST
app.post('/upload-employees',
  isAuth,
  isAdmin,
  upload.single('excelfile'),
  csrfProtection,
  async (req, res) => {
    const filePath = req.file.path;
    try {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      for (const emp of data) {
        if (emp['Emp. Code'] && emp['Resource Name']) {
          await Employee.findOneAndUpdate(
            { empCode: emp['Emp. Code'] },
            {
              empCode: emp['Emp. Code'],
              name: emp['Resource Name'],
              payrollCompany: emp['Payroll Company'],
              division: emp['Division'],
              location: emp['Location'],
              designation: emp['Designation'],
              homePractice: emp['Home Practice'],
              practiceManager: emp['Practice Manager'],
              project: ''
            },
            { upsert: true, new: true }
          );
        }
      }

      fs.unlinkSync(filePath);
      res.redirect('/dashboard/admin');
    } catch (err) {
      console.error('Excel Parse Error:', err);
      res.status(500).send('Error processing file.');
    }
  }
);

// Edit Employee GET
app.get('/employees/:id/edit', isAuth, isAdmin, csrfProtection, async (req, res) => {
  try {
    const employee = await Employee.findOne({ empCode: req.params.id });
    if (!employee) return res.status(404).send('Employee not found');
    res.render('edit-employee', { employee, csrfToken: req.csrfToken() });
  } catch (err) {
    console.error('Edit GET Error:', err);
    res.status(500).send('Server error');
  }
});

// Edit Employee POST
app.post('/employees/:id/edit', isAuth, isAdmin, csrfProtection, async (req, res) => {
  try {
    await Employee.findOneAndUpdate(
      { empCode: req.params.id },
      {
        empCode: req.body.empCode,
        name: req.body.name,
        payrollCompany: req.body.payrollCompany,
        division: req.body.division,
        location: req.body.location,
        designation: req.body.designation,
        homePractice: req.body.homePractice,
        practiceManager: req.body.practiceManager
      }
    );
    res.redirect('/dashboard/admin');
  } catch (err) {
    console.error('Edit POST Error:', err);
    res.status(500).send('Error updating employee');
  }
});

// Delete Employee POST
app.post('/employees/:id/delete', isAuth, isAdmin, csrfProtection, async (req, res) => {
  await Employee.deleteOne({ empCode: req.params.id });
  res.redirect('/dashboard/admin');
});

// Assign Project GET
app.get('/employees/:id/assign-project', isAuth, isAdmin, csrfProtection, async (req, res) => {
  const employee = await Employee.findOne({ empCode: req.params.id });
  if (!employee) return res.status(404).send('Employee not found');
  res.render('assign-project', { employee, csrfToken: req.csrfToken() });
});

// Assign Project POST
app.post('/employees/:id/assign-project', isAuth, isAdmin, csrfProtection, async (req, res) => {
  await Employee.findOneAndUpdate(
    { empCode: req.params.id },
    { project: req.body.project }
  );
  res.redirect('/dashboard/admin');
});

// ✅ New: Dismiss Project POST
app.post('/employees/:id/dismiss-project', isAuth, isAdmin, csrfProtection, async (req, res) => {
  try {
    await Employee.findOneAndUpdate(
      { empCode: req.params.id },
      { project: '' }
    );
    res.redirect('/dashboard/admin');
  } catch (err) {
    console.error('Dismiss Project Error:', err);
    res.status(500).send('Error dismissing project');
  }
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
