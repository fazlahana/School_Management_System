<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboard;
use App\Http\Controllers\Teacher\DashboardController as TeacherDashboard;
use App\Http\Controllers\Student\DashboardController as StudentDashboard;
use App\Http\Controllers\Admin\StudentController;
use App\Http\Controllers\Admin\TeacherController;
use App\Http\Controllers\Admin\ClassController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Admin\PaymentController;
use App\Http\Controllers\Admin\ExamController;

// Auth Routes
Route::group(['middleware' => 'api', 'prefix' => 'auth'], function ($router) {
    Route::post('login', [AuthController::class, 'login'])->name('login');
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::get('profile', [AuthController::class, 'profile']);
    Route::post('update-profile', [AuthController::class, 'updateProfile']);
    Route::post('update-password', [AuthController::class, 'updatePassword']);
    
    // OTP & Password Reset (Public)
    Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
    Route::post('reset-password', [AuthController::class, 'resetPassword']);
    Route::post('verify-otp', [AuthController::class, 'verifyOTP']);
    Route::post('resend-otp', [AuthController::class, 'resendOTP']);
    // Account Activation Flow
    Route::get('verify-token/{token}', [App\Http\Controllers\Auth\VerificationController::class, 'verifyToken']);
    Route::post('set-password', [App\Http\Controllers\Auth\VerificationController::class, 'setPassword']);
    Route::post('activate-account', [App\Http\Controllers\Auth\VerificationController::class, 'verifyOtp']);
});

// Admin Routes
Route::middleware(['auth:api', 'role:admin'])->prefix('admin')->group(function () {
    Route::get('dashboard', [AdminDashboard::class, 'index']);
    Route::get('students/export', [StudentController::class, 'exportCSV']);
    Route::post('students/import', [StudentController::class, 'importCSV']);
    Route::get('students/{id}/profile', [StudentController::class, 'getProfile']);
    Route::post('students/bulk-delete', [StudentController::class, 'bulkDelete']);
    Route::post('students/bulk-update', [StudentController::class, 'bulkUpdate']);
    Route::post('students/bulk-status', [StudentController::class, 'bulkStatusChange']);
    Route::post('students/bulk-email', [StudentController::class, 'bulkEmail']);
    Route::apiResource('students', StudentController::class);

    Route::post('teachers/bulk-delete', [TeacherController::class, 'bulkDelete']);
    Route::post('teachers/bulk-update', [TeacherController::class, 'bulkUpdate']);
    Route::apiResource('teachers', TeacherController::class);
    Route::get('teachers/{id}/subjects', [TeacherController::class, 'getSubjects']);
    Route::post('teachers/{id}/subjects', [TeacherController::class, 'assignSubjects']);
    Route::apiResource('classes', ClassController::class);
    Route::apiResource('subjects', SubjectController::class);
    Route::get('all-subjects', function() {
        return \App\Models\Subject::all();
    });
    // Payments
    Route::apiResource('payments', PaymentController::class);
    
    // Class-Wise Payments
    Route::get('class-payments', [App\Http\Controllers\Admin\ClassWisePaymentController::class, 'index']);
    Route::post('class-payments/pay', [App\Http\Controllers\Admin\ClassWisePaymentController::class, 'recordPayment']);
    Route::apiResource('exams', ExamController::class);

    // Advanced Payment Module
    Route::group(['prefix' => 'accounting'], function() {
        Route::get('summary', [App\Http\Controllers\Admin\PaymentAnalyticsController::class, 'getSummary']);
        Route::get('overdue', [App\Http\Controllers\Admin\PaymentAnalyticsController::class, 'getOverdueStudents']);
        
        // General Settings
        Route::get('settings', [App\Http\Controllers\Admin\SettingController::class, 'index'])->withoutMiddleware(['role']);
        Route::post('settings', [App\Http\Controllers\Admin\SettingController::class, 'update'])->withoutMiddleware(['role']);

        Route::apiResource('fee-structures', App\Http\Controllers\Admin\FeeStructureController::class);
        Route::apiResource('invoices', App\Http\Controllers\Admin\InvoiceController::class);
        Route::post('invoices/{id}/payments', [App\Http\Controllers\Admin\InvoiceController::class, 'addPayment']);
        Route::post('invoices/{id}/remind', [App\Http\Controllers\Admin\InvoiceController::class, 'sendReminder']);
        Route::get('payments/{id}/receipt', [App\Http\Controllers\Admin\InvoiceController::class, 'downloadReceipt']);
    });

    // Send Custom Notification (Private Message)
    Route::post('notifications/send', [App\Http\Controllers\NotificationController::class, 'sendCustomNotification']);
});

// Accountant Routes (Same as Admin Accounting for now)
Route::middleware(['auth:api', 'role:accountant'])->prefix('accountant')->group(function () {
    Route::get('summary', [App\Http\Controllers\Admin\PaymentAnalyticsController::class, 'getSummary']);
    Route::apiResource('invoices', App\Http\Controllers\Admin\InvoiceController::class);
    Route::post('invoices/{id}/payments', [App\Http\Controllers\Admin\InvoiceController::class, 'addPayment']);
});

// Teacher Routes
Route::middleware(['auth:api', 'role:teacher'])->prefix('teacher')->group(function () {
    Route::get('dashboard', [TeacherDashboard::class, 'index']);
    Route::get('classes', [App\Http\Controllers\Teacher\ClassController::class, 'index']);
    Route::get('classes/{id}', [App\Http\Controllers\Teacher\ClassController::class, 'show']);
    Route::get('subjects', [App\Http\Controllers\Teacher\ClassController::class, 'subjects']);
    Route::get('exams', [App\Http\Controllers\Teacher\ExamController::class, 'index']);
    Route::get('exams/{id}/marking', [App\Http\Controllers\Teacher\ExamController::class, 'getStudentsForMarking']);
    Route::post('exams/{id}/marks', [App\Http\Controllers\Teacher\ExamController::class, 'storeMarks']);
    Route::get('assignments/{id}/submissions', [App\Http\Controllers\Teacher\AssignmentController::class, 'getSubmissions']);
    Route::post('assignments/{id}/grade/{submissionId}', [App\Http\Controllers\Teacher\AssignmentController::class, 'gradeSubmission']);
    Route::apiResource('assignments', App\Http\Controllers\Teacher\AssignmentController::class);
});

// Student Routes
Route::middleware(['auth:api', 'role:student'])->prefix('student')->group(function () {
    Route::get('dashboard', [StudentDashboard::class, 'index']);
    Route::get('exams', [App\Http\Controllers\Student\ExamController::class, 'index']);
    Route::get('results', [App\Http\Controllers\Student\ResultController::class, 'index']);
    Route::get('assignments', [App\Http\Controllers\Student\AssignmentController::class, 'index']);
    Route::post('assignments/{id}/submit', [App\Http\Controllers\Student\AssignmentController::class, 'submit']);
});

// Public Settings Route
Route::get('/public-settings', [App\Http\Controllers\Admin\SettingController::class, 'publicSettings']);

// Notification Routes (shared by all roles)
Route::middleware(['auth:api'])->group(function () {
    Route::get('notifications', [App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('notifications/{id}/read', [App\Http\Controllers\NotificationController::class, 'markAsRead']);
    Route::post('notifications/mark-all-read', [App\Http\Controllers\NotificationController::class, 'markAllAsRead']);
    Route::post('notifications/test', [App\Http\Controllers\NotificationController::class, 'testNotification']);
});
