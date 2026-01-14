<!DOCTYPE html>
<html>
<head>
    <title>Welcome to School System</title>
</head>
<body>
    <h1>Welcome, {{ $user->name }}!</h1>
    <p>Your account has been created successfully.</p>
    <p><strong>Email:</strong> {{ $user->email }}</p>
    <p><strong>Password:</strong> {{ $password }}</p>
    <br>
    <p>Please login and change your password immediately.</p>
    <p>Thank you.</p>
</body>
</html>
