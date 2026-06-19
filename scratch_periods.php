<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$periods = \App\Models\Period::all();
echo "Current Date: " . now()->toDateTimeString() . "\n\n";

foreach ($periods as $period) {
    echo "Period ID: {$period->id} | Name: {$period->name}\n";
    echo "Start: {$period->start_date} | End: {$period->end_date} | Status: {$period->status}\n\n";
}
