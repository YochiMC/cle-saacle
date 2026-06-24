<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Student;
use App\Models\Exam;
use App\Models\ExamStudent;
use App\Models\Period;
use App\Enums\StudentStatus;
use Carbon\Carbon;

class TestModalitiesSeeder extends Seeder
{
    public function run(): void
    {
        $period = Period::firstOrCreate(
            ['name' => 'Ene-Jun 2026'],
            ['start_date' => '2026-01-01', 'end_date' => '2026-06-30']
        );

        // 1. Examen Acreditación
        $student1 = Student::factory()->create([
            'first_name' => 'Alumno Examen',
            'last_name' => 'Acreditacion',
            'status' => StudentStatus::ACCREDITED,
        ]);
        $exam1 = Exam::create([
            'period_id' => $period->id,
            'exam_date' => Carbon::now(),
            'exam_type' => 'Planes anteriores', // Fallbacks to 'examen-acreditacion'
            'status' => 'Concluido',
        ]);
        $student1->exams()->attach($exam1->id, [
            'calificacion' => 100,
            'final_average' => 100,
            'status' => 'approved'
        ]);

        // 2. Cuatro Habilidades
        $student2 = Student::factory()->create([
            'first_name' => 'Alumno Cuatro',
            'last_name' => 'Habilidades',
            'status' => StudentStatus::ACCREDITED,
        ]);
        $exam2 = Exam::create([
            'period_id' => $period->id,
            'exam_date' => Carbon::now(),
            'exam_type' => '4 Habilidades',
            'status' => 'Concluido',
        ]);
        $student2->exams()->attach($exam2->id, [
            'calificacion' => 100,
            'final_average' => 100,
            'status' => 'approved',
            'units_breakdown' => json_encode(['listening' => 100, 'reading' => 100, 'writing' => 100, 'speaking' => 100, 'certified_level' => 'B2'])
        ]);

        // 3. Otra Institución
        $student3 = Student::factory()->create([
            'first_name' => 'Alumno Otra',
            'last_name' => 'Institucion',
            'status' => StudentStatus::ACCREDITED,
        ]);
        $exam3 = Exam::create([
            'period_id' => $period->id,
            'exam_date' => Carbon::now(),
            'exam_type' => 'Convalidación',
            'status' => 'Concluido',
        ]);
        $student3->exams()->attach($exam3->id, [
            'calificacion' => 100,
            'final_average' => 100,
            'status' => 'approved',
            'units_breakdown' => json_encode(['certified_level' => 'B2'])
        ]);

        // 4. Cursos (Intermedio 5)
        $student4 = Student::factory()->create([
            'first_name' => 'Alumno Cursos',
            'last_name' => 'Regulares',
            'status' => StudentStatus::ACCREDITED,
        ]);
        
        $level = \App\Models\Level::firstOrCreate(['name' => 'Intermedio 5']);
        $group = \App\Models\Group::create([
            'period_id' => $period->id,
            'level_id' => $level->id,
            'teacher_id' => \App\Models\Teacher::factory()->create()->id,
            'name' => 'Grupo Test',
        ]);
        \App\Models\Qualification::create([
            'student_id' => $student4->id,
            'group_id' => $group->id,
            'final_average' => 100,
        ]);
    }
}
