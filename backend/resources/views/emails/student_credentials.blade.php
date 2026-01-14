<!DOCTYPE html>
<html>
<head>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: #4f46e5;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #f9fafb;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-radius: 0 0 8px 8px;
        }
        .credentials {
            background: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            margin: 20px 0;
        }
        .label {
            font-weight: bold;
            color: #6b7280;
            display: inline-block;
            width: 80px;
        }
        .value {
            color: #111827;
            font-family: monospace;
            font-size: 1.1em;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 0.8em;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome toEduSpire</h1>
    </div>
    <div class="content">
        <p>Hello <strong>{{ $user->name }}</strong>,</p>
        <p>Your student account has been created successfully. You can now log in to the student portal using the credentials below.</p>
        
        <div class="credentials">
            <p><span class="label">Email:</span> <span class="value">{{ $user->email }}</span></p>
            <p><span class="label">Password:</span> <span class="value">{{ $password }}</span></p>
        </div>

        <p>For security reasons, we recommend that you keep this information safe. You can change your password at any time from your profile settings.</p>
        
        <p>Regards,<br>School Management System</p>
    </div>
    <div class="footer">
        &copy; {{ date('Y') }} EduSpire School Management System. All rights reserved.
    </div>
</body>
</html>
