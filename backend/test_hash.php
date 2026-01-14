<?php
require __DIR__.'/vendor/autoload.php';
$app = require __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

$user = new User();
$user->password = 'test123456';
echo "Raw password: test123456\n";
echo "Hashed password in model: " . $user->password . "\n";
if (Hash::check('test123456', $user->password)) {
    echo "Hash check passed!\n";
} else {
    echo "Hash check FAILED!\n";
}
