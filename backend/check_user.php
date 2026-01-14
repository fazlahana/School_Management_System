<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = User::where('email', 'admin@school.com')->first();
if (!$user) {
    echo "User not found\n";
    exit;
}
echo "User found: " . $user->email . "\n";
echo "Password hash in DB: " . $user->password . "\n";
if (Hash::check('password123', $user->password)) {
    echo "Password matches!\n";
} else {
    echo "Password DOES NOT match!\n";
}
