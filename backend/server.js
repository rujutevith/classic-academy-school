const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config();
const app = express();

// ==================== MIDDLEWARE ====================
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use((req, res, next) => {
    console.log(`\n📨 ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        console.log('📦 Body:', req.body);
    }
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
    res.json({ success: true, receivedBody: req.body });
});

// ==================== LOGIN ENDPOINT ====================
app.post('/api/auth/login', async (req, res) => {
    console.log('\n🔐 LOGIN REQUEST');
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }
    
    const validUsers = {
        'kevine': { password: 'kevine123', role: 'hr', email: 'kevine@gmail.com', id: 3 },
        'admin': { password: 'admin123', role: 'admin', email: 'admin@classicacademy.rw', id: 1 },
        'thierry': { password: 'thierry123', role: 'manager', email: 'thierry@gmail.com', id: 2 }
    };
    
    const user = validUsers[username];
    
    if (!user || user.password !== password) {
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
    console.log('\n👤 PROFILE REQUEST for:', req.user.username);
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

// Helper functions
const getDepartmentName = (deptId) => {
    const dept = {1: 'Administration', 2: 'Teaching', 3: 'Finance', 4: 'ICT'};
    return dept[deptId] || 'Unknown';
};

const getEmployeeName = (employeeId) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee';
};

const getEmployeeById = (employeeId) => {
    return employees.find(e => e.id === employeeId);
};

// ==================== EMPLOYEE CRUD ====================
app.get('/api/employees', authenticateToken, (req, res) => {
    console.log('📋 GET all employees');
    const employeesWithDept = employees.map(emp => ({
        ...emp,
        department_name: getDepartmentName(emp.department_id),
        full_name: `${emp.first_name} ${emp.last_name}`
    }));
    res.json(employeesWithDept);
});

app.get('/api/employees/:id', authenticateToken, (req, res) => {
    const employee = employees.find(e => e.id === parseInt(req.params.id));
    if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    res.json({
        ...employee,
        full_name: `${employee.first_name} ${employee.last_name}`
    });
});

app.post('/api/employees', authenticateToken, (req, res) => {
    console.log('📝 CREATE employee:', req.body);
    
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
    console.log('✅ Employee created successfully, ID:', newEmployee.id);
    
    res.status(201).json({ 
        success: true, 
        message: 'Employee created successfully',
        employee: {
            ...newEmployee,
            full_name: `${newEmployee.first_name} ${newEmployee.last_name}`
        }
    });
});

app.put('/api/employees/:id', authenticateToken, (req, res) => {
    console.log('✏️ UPDATE employee:', req.params.id, req.body);
    
    const index = employees.findIndex(e => e.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    employees[index] = { ...employees[index], ...req.body };
    console.log('✅ Employee updated successfully');
    
    res.json({ 
        success: true, 
        message: 'Employee updated successfully', 
        employee: {
            ...employees[index],
            full_name: `${employees[index].first_name} ${employees[index].last_name}`
        }
    });
});

app.delete('/api/employees/:id', authenticateToken, (req, res) => {
    console.log('🗑️ DELETE employee:', req.params.id);
    
    const index = employees.findIndex(e => e.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Employee not found' });
    }
    
    employees.splice(index, 1);
    console.log('✅ Employee deleted successfully');
    
    res.json({ success: true, message: 'Employee deleted successfully' });
});

// ==================== DEPARTMENTS ====================
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

// ==================== SALARIES WITH EMPLOYEE NAMES ====================
let salaries = [
    { id: 1, employee_id: 1, month_year: '2026-05-01', base_salary: 800000, bonuses: 50000, deductions: 20000, net_salary: 830000, payment_status: 'paid', payment_date: '2026-05-25' },
    { id: 2, employee_id: 2, month_year: '2026-05-01', base_salary: 500000, bonuses: 30000, deductions: 15000, net_salary: 515000, payment_status: 'pending', payment_date: null },
    { id: 3, employee_id: 3, month_year: '2026-05-01', base_salary: 450000, bonuses: 20000, deductions: 10000, net_salary: 460000, payment_status: 'pending', payment_date: null },
    { id: 4, employee_id: 4, month_year: '2026-05-01', base_salary: 350000, bonuses: 10000, deductions: 5000, net_salary: 355000, payment_status: 'pending', payment_date: null }
];

// GET all salaries with employee names
app.get('/api/salaries', authenticateToken, (req, res) => {
    console.log('📋 GET all salaries');
    const salariesWithNames = salaries.map(salary => {
        const employee = getEmployeeById(salary.employee_id);
        return {
            id: salary.id,
            employee_id: salary.employee_id,
            employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee',
            employee_code: employee ? employee.employee_code : 'N/A',
            month_year: salary.month_year,
            base_salary: salary.base_salary,
            bonuses: salary.bonuses,
            deductions: salary.deductions,
            net_salary: salary.net_salary,
            payment_status: salary.payment_status,
            payment_date: salary.payment_date
        };
    });
    res.json(salariesWithNames);
});

// GET single salary
app.get('/api/salaries/:id', authenticateToken, (req, res) => {
    const salary = salaries.find(s => s.id === parseInt(req.params.id));
    if (!salary) {
        return res.status(404).json({ success: false, message: 'Salary record not found' });
    }
    const employee = getEmployeeById(salary.employee_id);
    res.json({
        ...salary,
        employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee',
        employee_code: employee ? employee.employee_code : 'N/A'
    });
});

// CREATE salary
app.post('/api/salaries', authenticateToken, (req, res) => {
    console.log('📝 CREATE salary:', req.body);
    
    const newSalary = {
        id: salaries.length + 1,
        employee_id: parseInt(req.body.employee_id),
        month_year: req.body.month_year || new Date().toISOString().slice(0, 10),
        base_salary: parseFloat(req.body.base_salary) || 0,
        bonuses: parseFloat(req.body.bonuses) || 0,
        deductions: parseFloat(req.body.deductions) || 0,
        net_salary: parseFloat(req.body.net_salary) || (parseFloat(req.body.base_salary) || 0),
        payment_status: req.body.payment_status || 'pending',
        payment_date: req.body.payment_date || null
    };
    
    salaries.push(newSalary);
    const employee = getEmployeeById(newSalary.employee_id);
    
    res.status(201).json({ 
        success: true, 
        message: 'Salary record created successfully',
        salary: {
            ...newSalary,
            employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee'
        }
    });
});

// UPDATE salary
app.put('/api/salaries/:id', authenticateToken, (req, res) => {
    console.log('✏️ UPDATE salary:', req.params.id, req.body);
    
    const index = salaries.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Salary record not found' });
    }
    
    salaries[index] = { ...salaries[index], ...req.body };
    const employee = getEmployeeById(salaries[index].employee_id);
    
    res.json({ 
        success: true, 
        message: 'Salary record updated successfully',
        salary: {
            ...salaries[index],
            employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee'
        }
    });
});

// DELETE salary
app.delete('/api/salaries/:id', authenticateToken, (req, res) => {
    console.log('🗑️ DELETE salary:', req.params.id);
    
    const index = salaries.findIndex(s => s.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Salary record not found' });
    }
    
    salaries.splice(index, 1);
    res.json({ success: true, message: 'Salary record deleted successfully' });
});

// ==================== ATTENDANCE WITH EMPLOYEE NAMES ====================
let attendance = [
    { id: 1, employee_id: 1, date: '2026-05-25', check_in: '08:00:00', check_out: '17:00:00', status: 'present', remarks: 'On time' },
    { id: 2, employee_id: 2, date: '2026-05-25', check_in: '08:30:00', check_out: '17:00:00', status: 'late', remarks: 'Traffic' },
    { id: 3, employee_id: 3, date: '2026-05-25', check_in: '08:00:00', check_out: '16:30:00', status: 'present', remarks: '' },
    { id: 4, employee_id: 4, date: '2026-05-25', check_in: '09:00:00', check_out: '17:00:00', status: 'late', remarks: 'Doctor appointment' }
];

// GET all attendance with employee names
app.get('/api/attendance', authenticateToken, (req, res) => {
    console.log('📋 GET all attendance');
    const attendanceWithNames = attendance.map(att => {
        const employee = getEmployeeById(att.employee_id);
        return {
            id: att.id,
            employee_id: att.employee_id,
            employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee',
            employee_code: employee ? employee.employee_code : 'N/A',
            date: att.date,
            check_in: att.check_in,
            check_out: att.check_out,
            status: att.status,
            remarks: att.remarks
        };
    });
    res.json(attendanceWithNames);
});

// GET single attendance
app.get('/api/attendance/:id', authenticateToken, (req, res) => {
    const att = attendance.find(a => a.id === parseInt(req.params.id));
    if (!att) {
        return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    const employee = getEmployeeById(att.employee_id);
    res.json({
        ...att,
        employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee'
    });
});

// CREATE attendance
app.post('/api/attendance', authenticateToken, (req, res) => {
    console.log('📝 CREATE attendance:', req.body);
    
    const newAttendance = {
        id: attendance.length + 1,
        employee_id: parseInt(req.body.employee_id),
        date: req.body.date || new Date().toISOString().split('T')[0],
        check_in: req.body.check_in || null,
        check_out: req.body.check_out || null,
        status: req.body.status || 'present',
        remarks: req.body.remarks || ''
    };
    
    attendance.push(newAttendance);
    const employee = getEmployeeById(newAttendance.employee_id);
    
    res.status(201).json({ 
        success: true, 
        message: 'Attendance recorded successfully',
        attendance: {
            ...newAttendance,
            employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee'
        }
    });
});

// UPDATE attendance
app.put('/api/attendance/:id', authenticateToken, (req, res) => {
    console.log('✏️ UPDATE attendance:', req.params.id, req.body);
    
    const index = attendance.findIndex(a => a.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    
    attendance[index] = { ...attendance[index], ...req.body };
    const employee = getEmployeeById(attendance[index].employee_id);
    
    res.json({ 
        success: true, 
        message: 'Attendance updated successfully',
        attendance: {
            ...attendance[index],
            employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown Employee'
        }
    });
});

// DELETE attendance
app.delete('/api/attendance/:id', authenticateToken, (req, res) => {
    console.log('🗑️ DELETE attendance:', req.params.id);
    
    const index = attendance.findIndex(a => a.id === parseInt(req.params.id));
    if (index === -1) {
        return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    
    attendance.splice(index, 1);
    res.json({ success: true, message: 'Attendance deleted successfully' });
});

// ==================== REPORTS ENDPOINTS ====================

// Dashboard report
app.get('/api/reports/dashboard', authenticateToken, (req, res) => {
    console.log('📊 GET dashboard report');
    
    const totalEmployees = employees.length;
    const activeEmployees = employees.filter(e => e.status === 'active').length;
    const totalDepartments = departments.length;
    const monthlyPayroll = salaries
        .filter(s => s.month_year === new Date().toISOString().slice(0, 10))
        .reduce((sum, s) => sum + (s.net_salary || 0), 0);
    
    const today = new Date().toISOString().split('T')[0];
    const todayAttendance = attendance.filter(a => a.date === today);
    const presentToday = todayAttendance.filter(a => a.status === 'present').length;
    
    const departmentDistribution = departments.map(dept => ({
        name: dept.name,
        count: employees.filter(e => e.department_id === dept.id).length
    }));
    
    res.json({
        success: true,
        data: {
            summary: {
                totalEmployees,
                activeEmployees,
                totalDepartments,
                monthlyPayroll,
                presentToday,
                attendanceRate: totalEmployees > 0 ? ((presentToday / totalEmployees) * 100).toFixed(1) : 0
            },
            departmentDistribution,
            recentEmployees: employees.slice(0, 5).map(emp => ({
                ...emp,
                full_name: `${emp.first_name} ${emp.last_name}`,
                department_name: getDepartmentName(emp.department_id)
            }))
        }
    });
});

// Employee report
app.get('/api/reports/employees', authenticateToken, (req, res) => {
    console.log('📊 GET employee report');
    
    res.json({
        success: true,
        report: {
            title: 'Employee Report',
            generated_date: new Date().toISOString(),
            total_employees: employees.length,
            employees: employees.map(emp => ({
                id: emp.id,
                employee_code: emp.employee_code,
                name: `${emp.first_name} ${emp.last_name}`,
                position: emp.position,
                department: getDepartmentName(emp.department_id),
                email: emp.email,
                phone: emp.phone,
                hire_date: emp.hire_date,
                salary: emp.salary,
                status: emp.status
            }))
        }
    });
});

// Salary report
app.get('/api/reports/salaries', authenticateToken, (req, res) => {
    console.log('📊 GET salary report');
    
    const salaryReport = salaries.map(salary => {
        const employee = getEmployeeById(salary.employee_id);
        return {
            id: salary.id,
            employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown',
            month_year: salary.month_year,
            base_salary: salary.base_salary,
            bonuses: salary.bonuses,
            deductions: salary.deductions,
            net_salary: salary.net_salary,
            payment_status: salary.payment_status
        };
    });
    
    const totalPayroll = salaries.reduce((sum, s) => sum + (s.net_salary || 0), 0);
    const paidAmount = salaries.filter(s => s.payment_status === 'paid').reduce((sum, s) => sum + (s.net_salary || 0), 0);
    const pendingAmount = salaries.filter(s => s.payment_status === 'pending').reduce((sum, s) => sum + (s.net_salary || 0), 0);
    
    res.json({
        success: true,
        report: {
            title: 'Salary Report',
            generated_date: new Date().toISOString(),
            summary: {
                total_payroll: totalPayroll,
                paid_amount: paidAmount,
                pending_amount: pendingAmount,
                total_records: salaries.length
            },
            salaries: salaryReport
        }
    });
});

// Attendance report
app.get('/api/reports/attendance', authenticateToken, (req, res) => {
    console.log('📊 GET attendance report');
    
    const attendanceReport = attendance.map(att => {
        const employee = getEmployeeById(att.employee_id);
        return {
            id: att.id,
            employee_name: employee ? `${employee.first_name} ${employee.last_name}` : 'Unknown',
            date: att.date,
            check_in: att.check_in,
            check_out: att.check_out,
            status: att.status,
            remarks: att.remarks
        };
    });
    
    const presentCount = attendance.filter(a => a.status === 'present').length;
    const lateCount = attendance.filter(a => a.status === 'late').length;
    const absentCount = attendance.filter(a => a.status === 'absent').length;
    
    res.json({
        success: true,
        report: {
            title: 'Attendance Report',
            generated_date: new Date().toISOString(),
            summary: {
                total_records: attendance.length,
                present: presentCount,
                late: lateCount,
                absent: absentCount,
                attendance_rate: attendance.length > 0 ? ((presentCount / attendance.length) * 100).toFixed(1) : 0
            },
            attendance: attendanceReport
        }
    });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 Server running on http://localhost:${PORT}`);
    console.log(`🔐 Login: POST http://localhost:${PORT}/api/auth/login`);
    console.log(`📋 Employees: GET http://localhost:${PORT}/api/employees`);
    console.log(`💰 Salaries: GET http://localhost:${PORT}/api/salaries`);
    console.log(`📅 Attendance: GET http://localhost:${PORT}/api/attendance`);
    console.log(`📊 Reports: GET http://localhost:${PORT}/api/reports/dashboard`);
    console.log('\n✅ Server ready! Employee names will now appear in salaries and attendance.\n');
});