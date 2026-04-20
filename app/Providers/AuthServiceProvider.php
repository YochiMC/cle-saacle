<?php

namespace App\Providers;

use App\Models\Degree;
use App\Models\Document;
use App\Models\Level;
use App\Models\Period;
use App\Models\Student;
use App\Models\Teacher;
use App\Models\User;
use App\Policies\DegreePolicy;
use App\Policies\DocumentPolicy;
use App\Policies\LevelPolicy;
use App\Policies\PeriodPolicy;
use App\Policies\StudentPolicy;
use App\Policies\TeacherPolicy;
use App\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * Los mapeos explícitos de policies mantienen consistente la resolución de Gate.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        User::class => UserPolicy::class,
        Student::class => StudentPolicy::class,
        Teacher::class => TeacherPolicy::class,
        Document::class => DocumentPolicy::class,
        Period::class => PeriodPolicy::class,
        Level::class => LevelPolicy::class,
        Degree::class => DegreePolicy::class,
    ];

    /**
     * Registra las policies de la aplicación.
     */
    public function boot(): void
    {
        $this->registerPolicies();
    }
}
