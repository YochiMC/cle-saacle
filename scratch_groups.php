<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

// Resolve active period
$windowResolver = app(\App\Services\EnrollmentWindowResolver::class);
$activePeriod = $windowResolver->resolveActivePeriod();

echo "Active Period ID: " . ($activePeriod ? $activePeriod->id : 'NONE') . "\n";
echo "Is Enrollment Open: " . ($windowResolver->isOpen($activePeriod) ? 'YES' : 'NO') . "\n";

if ($activePeriod) {
    $grupos = \App\Models\Group::with(['level', 'period', 'qualifications'])
        ->where('period_id', $activePeriod->id)
        ->get();
    
    echo "\nTotal Groups in Period: " . $grupos->count() . "\n";
    foreach($grupos as $group) {
        echo "Group ID: {$group->id} | Name: {$group->name} | Type: " . ($group->type?->value ?? $group->type) . " | Level: {$group->level_id} | Status: {$group->status}\n";
    }
}
