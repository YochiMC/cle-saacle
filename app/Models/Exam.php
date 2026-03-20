<?php
// app/Models/Exam.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Exam extends Model
{
    protected $fillable = [
        'student_id',
        'nombre_examen',
        'calificacion',
        'fecha_aplicacion',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
