<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        // Registro de Observers para Sincronización de Estado de Alumnos
        \App\Models\Group::observe(\App\Observers\GroupObserver::class);
        \App\Models\Exam::observe(\App\Observers\ExamObserver::class);
    }
}
