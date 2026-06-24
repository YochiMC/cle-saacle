<?php
$period = \App\Models\Period::firstOrCreate(
    ['name' => 'Ene-Jun 2026'],
    ['start_date' => '2026-01-01', 'end_date' => '2026-06-30']
);

foreach (['Planes anteriores' => 'Acreditacion', '4 habilidades' => 'Habilidades', 'Convalidación' => 'Institucion'] as $type => $name) { 
    $student = \App\Models\Student::factory()->create(['first_name' => 'Alumno', 'last_name' => $name, 'status' => 'accredited']); 
    $exam = \App\Models\Exam::factory()->create(['name' => 'Examen Prueba', 'period_id' => $period->id, 'exam_type' => $type, 'status' => 'completed']); 
    $student->exams()->attach($exam->id, ['final_average' => 100, 'units_breakdown' => json_encode(['certified_level' => 'B2'])]); 
} 

$student4 = \App\Models\Student::factory()->create(['first_name' => 'Alumno', 'last_name' => 'Regulares', 'status' => 'accredited']); 
$exam4 = \App\Models\Exam::factory()->create(['name' => 'Examen Prueba', 'period_id' => $period->id, 'exam_type' => 'Ubicación', 'status' => 'completed']); 
$student4->exams()->attach($exam4->id, ['final_average' => 100, 'units_breakdown' => json_encode(['certified_level' => 'B2'])]); 

echo "OK\n";
