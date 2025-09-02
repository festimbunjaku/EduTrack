
# EduTrack 📚

EduTrack is a comprehensive educational management system built with TypeScript, PHP, and JavaScript, designed to facilitate seamless interaction between students, teachers, and administrators in an educational environment.

## 🔄 Status

Project is: _not finished_

## 🌟 Features

### For Students
- Course enrollment and management
- Assignment submission and tracking
- Progress monitoring across enrolled courses
- Real-time completion rate tracking
- Personal dashboard with pending homework view

### For Teachers
- Course creation and management
- Student progress monitoring
- Assignment creation and grading
- Student enrollment management
- Detailed analytics and reporting

### For Administrators
- Platform-wide monitoring
- User management
- System health tracking
- Analytics and reporting
- Course oversight

## 🚀 Technology Stack

- **Frontend**: TypeScript/React
- **Backend**: PHP/Laravel
- **Other Technologies**:
  - JavaScript (1.4%)
  - PHP (23.8%)
  - TypeScript (74%)

## 🛠 Installation

1. Clone the repository:
```bash
git clone https://github.com/festimbunjaku/EduTrack.git
cd EduTrack
```

2. Install PHP dependencies:
```bash
composer install
```

3. Install Node dependencies:
```bash
npm install
```

4. Configure your environment:
```bash
cp .env.example .env
php artisan key:generate
```

5. Set up the database:
```bash
php artisan migrate
php artisan db:seed
```

6. Start the development server:
```bash
php artisan serve
npm run dev
```

## 🔐 Default Credentials

After seeding the database, you can use these default credentials:

```
Admin:
Email: admin@edutrack.com
Password: 12345678
```

## 🏗 Project Structure

```
EduTrack/
├── app/
│   ├── Http/Controllers/
│   │   ├── DashboardController.php
│   │   ├── Teacher/
│   │   └── Student/
│   └── Models/
├── resources/
│   └── js/
│       └── pages/
├── database/
│   ├── migrations/
│   └── seeders/
└── routes/
```

## 🔑 Key Features in Detail

### Course Management
- Create and manage courses
- Enroll students
- Track course progress
- Manage course materials

### Assignment System
- Create and assign homework
- Submit assignments
- Grade submissions
- Track completion rates

### User Roles
- **Students**: Enroll in courses, submit assignments, track progress
- **Teachers**: Create courses, manage assignments, review submissions
- **Administrators**: Overall system management

### Analytics and Reporting
- Course completion rates
- Student performance metrics
- System-wide statistics
- Activity tracking

