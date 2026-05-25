const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();

// ==================== MIDDLEWARE - MUST BE IN THIS ORDER ====================

// 1. CORS first
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// 2. Raw body parser (captures raw request)
app.use((req, res, next) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        if (data) {
            try {
                req.rawBody = data;
                req.body = JSON.parse(data);
                console.log('✅ Body parsed successfully:', req.body);
            } catch (e) {
                console.log('❌ Failed to parse JSON:', data);
                req.body = {};
            }
        } else {
            req.body = {};
        }
        next();
    });
    if (req.headers['content-length'] === '0' || !req.readable) {
        req.body = {};
        next();
    }
});

// 3. Express JSON parser (backup)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 4. Logging middleware
app.use((req, res, next) => {
    console.log(`\n📨 ${req.method} ${req.url}`);
    console.log('Headers:', req.headers['content-type']);
    console.log('Body:', req.body);
    next();
});

// ==================== JWT SECRET ====================
const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key_change_this';

// ==================== AUTH MIDDLEWARE ====================
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Access token required' 
        });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false, 
            message: 'Invalid or expired token' 
        });
    }
};

// ==================== TEST ENDPOINTS ====================
app.get('/test', (req, res) => {
    res.json({ success: true, message: 'Server is running!' });
});

app.post('/test-body', (req, res) => {
    console.log('Test body received:', req.body);
    res.json({ success: true, receivedBody: req.body });
});

// ==================== LOGIN ENDPOINT ====================
app.post('/api/auth/login', (req, res) => {
    console.log('\n🔐 LOGIN REQUEST');
    console.log('Received body:', req.body);
    
    const { username, password } = req.body;
    
    if (!username || !password) {
        console.log('❌ Missing username or password');
        return res.status(400).json({
            success: false,
            message: 'Username and password are required',
            received: req.body
        });
    }
    
    // Valid users for testing
    const validUsers = {
        'kevine': { password: 'kevine123', role: 'hr', email: 'kevine@gmail.com', id: 3 },
        'admin': { password: 'admin123', role: 'admin', email: 'admin@classicacademy.rw', id: 1 },
        'thierry': { password: 'thierry123', role: 'manager', email: 'thierry@gmail.com', id: 2 }
    };
    
    const user = validUsers[username];
    
    if (!user || user.password !== password) {
        console.log('❌ Invalid credentials for:', username);
        return res.status(401).json({
            success: false,
            message: 'Invalid credentials'
        });
    }
    
    const token = jwt.sign(
        { id: user.id, username: username, role: user.role, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
    );
    
    console.log('✅ Login successful for:', username);
    
    res.json({
        success: true,
        message: 'Login successful',
        token: token,
        user: {
            id: user.id,
            username: username,
            email: user.email,
            role: user.role
        }
    });
});

// ==================== PROFILE ENDPOINT ====================
app.get('/api/auth/profile', authenticateToken, (req, res) => {
    res.json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        role: req.user.role,
        firstName: null,
        lastName: null,
        employee_id: null,
        is_active: true,
        created_at: new Date().toISOString()
    });
});

// ==================== EMPLOYEES DATA ====================
let employees = [
    { id: 1, employee_code: 'EMP001', first_name: 'John', last_name: 'Muhire', email: 'john@classicacademy.rw', phone: '+250788123456', position: 'Principal', department_id: 1, hire_date: '2020-01-15', salary: 800000, status: 'active' },
    { id: 2, employee_code: 'EMP002', first_name: 'Marie', last_name: 'Uwimana', email: 'marie@classicacademy.rw', phone: '+250788123457', position: 'Senior Teacher', department_id: 2, hire_date: '2020-02-01', salary: 500000, status: 'active' },
    { id: 3, employee_code: 'EMP003', first_name: 'Peter', last_name: 'Habimana', email: 'peter@classicacademy.rw', phone: '+250788123458', position: 'Accountant', department_id: 3, hire_date: '2021-03-10', salary: 450000, status: 'active' },
    { id: 4, employee_code: 'EMP004', first_name: 'Fifi', last_name: 'Kevine', email: 'fifi@classicacademy.rw', phone: '+250788123459', position: 'Staff', department_id: 1, hire_date: '2025-01-15', salary: 350000, status: 'active' }
];

let nextEmployeeId = 5;

const getDepartmentName = (deptId) => {
    const dept = {1: 'Administration', 2: 'Teaching', 3: 'Finance', 4: 'ICT'};
    return dept[deptId] || 'Unknown';
};

const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee';
};

// EMPLOYEE CRUD
app.get('/api/employees', authenticateToken, (req, res) => {
    const employeesWithDept = employees.map(emp => ({
        ...emp,
        department_name: getDepartmentName(emp.department_id)
    }));
    res.json(employeesWithDept);
});

app.get('/api/employees/:id', authenticateToken, (req, res) => {
    const employee = employees.find(e => e.id === parseInt(req.params.id));
    if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json(employee);
});

app.post('/api/employees', authenticateToken, (req, res) => {
    const newEmployee = {
        id: nextEmployeeId++,
        employee_code: req.body.employee_code || `EMP00${nextEmployeeId}`,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        phone: req.body.phone || '',
        position: req.body.position || 'Staff',
        department_id: req.body.department_id || 1,
        hire_date: req.body.hire_date || new Date().toISOString().split('T')[0],
        salary: req.body.salary || 300000,
        status: req.body.status || 'active'
    };
    
    employees.push(newEmployee);
    res.status(201).json({ success: true, message: 'Employee created', employee: newEmployee });
});

app.put('/api/employees/:id', authenticateToken, (req, res) => {
    const index = employees.findIndex(e => e.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    employees[index] = { ...employees[index], ...req.body };
    res.json({ success: true, message: 'Employee updated', employee: employees[index] });
});

app.delete('/api/employees/:id', authenticateToken, (req, res) => {
    const index = employees.findIndex(e => e.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    employees.splice(index, 1);
    res.json({ success: true, message: 'Employee deleted' });
});

// DEPARTMENTS
let departments = [
    { id: 1, name: 'Administration', description: 'School administration' },
    { id: 2, name: 'Teaching', description: 'Teaching staff' },
    { id: 3, name: 'Finance', description: 'Finance department' },
    { id: 4, name: 'ICT', description: 'IT department' }
];

app.get('/api/departments', authenticateToken, (req, res) => {
    res.json(departments);
});

app.post('/api/departments', authenticateToken, (req, res) => {
    const newDept = { id: departments.length + 1, ...req.body };
    departments.push(newDept);
    res.status(201).json({ success: true, message: 'Department created', department: newDept });
});

app.put('/api/departments/:id', authenticateToken, (req, res) => {
    const index = departments.findIndex(d => d.id === parseInt(req.params.id));
    if (index !== -1) {
        departments[index] = { ...departments[index], ...req.body };
        res.json({ success: true, message: 'Department updated' });
    } else {
        res.status(404).json({ success: false, message: 'Department not found' });
    }
});

app.delete('/api/departments/:id', authenticateToken, (req, res) => {
    departments = departments.filter(d => d.id !== parseInt(req.params.id));
    res.json({ success: true, message: 'Department deleted' });
});

// SALARIES
let salaries = [
    { id: 1, employee_id: 1, month_year: '2026-05-01', base_salary: 800000, bonuses: 50000, deductions: 20000, net_salary: 830000, payment_status: 'paid' },
    { id: 2, employee_id: 2, month_year: '2026-05-01', base_salary: 500000, bonuses: 30000, deductions: 15000, net_salary: 515000, payment_status: 'pending' },
    { id: 3, employee_id: 3, month_year: '2026-05-01', base_salary: 450000, bonuses: 20000, deductions: 10000, net_salary: 460000, payment_status: 'pending' }
];

app.get('/api/salaries', authenticateToken, (req, res) => {
    const salariesWithNames = salaries.map(s => ({
        ...s,
        employee_name: getEmployeeName(s.employee_id)
    }));
    res.json(salariesWithNames);
});

app.post('/api/salaries', authenticateToken, (req, res) => {
    const newSalary = {
        id: salaries.length + 1,
        employee_id: req.body.employee_id,
        month_year: req.body.month_year,
        base_salary: req.body.base_salary,
        bonuses: req.body.bonuses || 0,
        deductions: req.body.deductions || 0,
        net_salary: req.body.net_salary,
        payment_status: req.body.payment_status || 'pending'
    };
    salaries.push(newSalary);
    res.status(201).json({ success: true, message: 'Salary created', salary: newSalary });
});

app.put('/api/salaries/:id', authenticateToken, (req, res) => {
    const index = salaries.findIndex(s => s.id === parseInt(req.params.id));
    if (index !== -1) {
        salaries[index] = { ...salaries[index], ...req.body };
        res.json({ success: true, message: 'Salary updated' });
    } else {
        res.status(404).json({ success: false, message: 'Salary not found' });
    }
});

app.delete('/api/salaries/:id', authenticateToken, (req, res) => {
    salaries = salaries.filter(s => s.id !== parseInt(req.params.id));
    res.json({ success: true, message: 'Salary deleted' });
});

// ATTENDANCE
let attendance = [
    { id: 1, employee_id: 1, date: '2026-05-25', check_in: '08:00:00', check_out: '17:00:00', status: 'present', remarks: 'On time' },
    { id: 2, employee_id: 2, date: '2026-05-25', check_in: '08:30:00', check_out: '17:00:00', status: 'late', remarks: 'Traffic' },
    { id: 3, employee_id: 3, date: '2026-05-25', check_in: '08:00:00', check_out: '16:30:00', status: 'present', remarks: '' }
];

app.get('/api/attendance', authenticateToken, (req, res) => {
    const attendanceWithNames = attendance.map(a => ({
        ...a,
        employee_name: getEmployeeName(a.employee_id)
    }));
    res.json(attendanceWithNames);
});

app.post('/api/attendance', authenticateToken, (req, res) => {
    const newAttendance = {
        id: attendance.length + 1,
        employee_id: req.body.employee_id,
        date: req.body.date,
        check_in: req.body.check_in,
        check_out: req.body.check_out,
        status: req.body.status,
        remarks: req.body.remarks || ''
    };
    attendance.push(newAttendance);
    res.status(201).json({ success: true, message: 'Attendance recorded', attendance: newAttendance });
});

app.put('/api/attendance/:id', authenticateToken, (req, res) => {
    const index = attendance.findIndex(a => a.id === parseInt(req.params.id));
    if (index !== -1) {
        attendance[index] = { ...attendance[index], ...req.body };
        res.json({ success: true, message: 'Attendance updated' });
    } else {
        res.status(404).json({ success: false, message: 'Attendance not found' });
    }
});

app.delete('/api/attendance/:id', authenticateToken, (req, res) => {
    attendance = attendance.filter(a => a.id !== parseInt(req.params.id));
    res.json({ success: true, message: 'Attendance deleted' });
});

// REPORTS
app.get('/api/reports/dashboard', authenticateToken, (req, res) => {
    res.json({
        success: true,
        data: {
            summary: {
                totalEmployees: employees.length,
                totalDepartments: departments.length,
                monthlyPayroll: salaries.reduce((sum, s) => sum + s.net_salary, 0)
            },
            recentEmployees: employees.slice(0, 5)
        }
    });
});

app.get('/api/reports/employees', authenticateToken, (req, res) => {
    res.json({
        success: true,
        report: {
            title: 'Employee Report',
            generated_date: new Date().toISOString(),
            total_employees: employees.length,
            employees: employees
        }
    });
});

app.get('/api/reports/salaries', authenticateToken, (req, res) => {
    res.json({
        success: true,
        report: {
            title: 'Salary Report',
            generated_date: new Date().toISOString(),
            salaries: salaries
        }
    });
});

app.get('/api/reports/attendance', authenticateToken, (req, res) => {
    res.json({
        success: true,
        report: {
            title: 'Attendance Report',
            generated_date: new Date().toISOString(),
            attendance: attendance
        }
    });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`📋 Employees: GET http://localhost:${PORT}/api/employees`);
    console.log('\n✅ Test with curl:');
    console.log(`curl -X POST http://localhost:${PORT}/api/auth/login -H "Content-Type: application/json" -d "{\\"username\\":\\"kevine\\",\\"password\\":\\"kevine123\\"}"\n`);
});