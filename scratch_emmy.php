<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$student = \App\Models\Student::where('first_name', 'like', '%EMMY%')->first();
if($student) {
    echo "Student Name: " . $student->first_name . " " . $student->last_name . "\n";
    echo "Level: " . $student->level_id . "\n";
    echo "Status: " . $student->status->value . "\n";
    echo "Approved Course Types: " . json_encode($student->approvedCourseTypeValues()) . "\n";
    echo "Services: " . json_encode($student->services()->get(['type', 'status'])->toArray()) . "\n";
} else {
    echo "No student EMMY found\n";
}
