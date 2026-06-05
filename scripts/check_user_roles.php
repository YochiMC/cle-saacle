<?php
require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$emailCandidates = [
    'yochi@correo.com',
    'yochi@correo.com.mx'
];

foreach ($emailCandidates as $email) {
    $u = App\Models\User::where('email', $email)->first();
    if ($u) {
        echo "User: {$email}\n";
        echo "ID: {$u->id}\n";
        echo "Name: {$u->name}\n";
        echo "Roles: ";
        print_r($u->getRoleNames()->toArray());
        echo "---\n";
    } else {
        echo "User not found: {$email}\n---\n";
    }
}
