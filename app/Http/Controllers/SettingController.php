<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Gate;
use App\Models\Setting;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use App\Jobs\RunAcademicStatusAutoUpdater;

/**
 * Controlador para la gestión de Configuraciones del Sistema.
 *
 * Permite a administrador y coordinador consultar y actualizar de forma masiva los parámetros
 * globales del sistema (fechas de inscripción, periodos de clases, etc.) que son
 * consumidos para automatizar los estados de Grupos y Exámenes.
 *
 * Principio SRP: Este controlador únicamente orquesta la lectura y escritura
 * de la tabla `settings`. La lógica de negocio derivada (cambio de estados)
 * es responsabilidad de sus propios servicios/observers.
 */
class SettingController extends Controller
{
    /**
     * Claves de configuración reconocidas por el sistema.
     * Actúa como "lista blanca" (allowlist) para evitar escrituras arbitrarias.
     */
    private const CLAVES_PERMITIDAS = [
        // ── Calendario de Cursos Regulares ─────────────────────────────────
        'courses_enrollment_start',
        'courses_enrollment_end',
        'courses_active_start',
        'courses_active_end',
        'courses_evaluation_start',
        'courses_evaluation_end',

        // ── Calendario de Exámenes ──────────────────────────────────────────
        'exams_enrollment_start',
        'exams_enrollment_end',
        'exams_evaluation_start',
        'exams_evaluation_end',

        // ── Calendario Programa Egresados (PE) ─────────────────────────────
        'pe_enrollment_start',
        'pe_enrollment_end',
        'pe_active_start',
        'pe_active_end',
        'pe_evaluation_start',
        'pe_evaluation_end',

        // ── Configuración Visual ────────────────────────────────────────────
        'teacher_reveal_date',
    ];

    /**
     * Muestra la vista de Configuraciones del Sistema.
     *
     * Carga todos los registros de `settings` y los transforma en un objeto
     * clave-valor simple para que el frontend pueda inicializar su formulario
     * directamente sin transformaciones adicionales.
     *
     * @return Response
     */
    public function index(): Response
    {
        Gate::authorize('viewAny', Setting::class);
        // Convertimos la colección a un objeto plano { key => value, ... }
        $configuraciones = Setting::all()
            ->pluck('value', 'key')
            ->toArray();

        return Inertia::render('Settings/Index', [
            'configuraciones' => $configuraciones,
        ]);
    }

    /**
     * Actualiza (o crea) múltiples configuraciones en una sola petición.
     *
     * Recibe el objeto plano { campo: valor } que envía Inertia `useForm` directamente,
     * valida cada clave con fecha nullable y realiza un `updateOrCreate` por cada par,
     * garantizando idempotencia.
     *
     * Formato esperado del request:
     *   { courses_enrollment_start: '2026-08-01', courses_enrollment_end: '2026-08-31', ... }
     *
     * @param  Request  $request
     * @return RedirectResponse
     */
    public function updateBulk(Request $request): RedirectResponse
    {
        Gate::authorize('updateAny', Setting::class);

        // Construimos las reglas de validación dinámicamente desde la lista blanca
        $reglas = collect(self::CLAVES_PERMITIDAS)
            ->mapWithKeys(fn ($clave) => [$clave => 'nullable|date|max:255'])
            ->toArray();

        $datosValidados = $request->validate($reglas);

        $academicSettingsChanged = false;

        // Iteramos solo sobre las claves reconocidas para garantizar la allowlist
        foreach (self::CLAVES_PERMITIDAS as $clave) {
            // Solo guardamos campos que vinieron en el request
            if (! array_key_exists($clave, $datosValidados)) {
                continue;
            }

            $setting = Setting::updateOrCreate(
                ['key'   => $clave],
                ['value' => $datosValidados[$clave] ?? null],
            );

            if ($clave !== 'teacher_reveal_date' && ($setting->wasChanged('value') || $setting->wasRecentlyCreated)) {
                $academicSettingsChanged = true;
            }
        }

        // Disparamos la actualización asíncrona de los estados académicos
        // solo si se modificaron fechas de calendario, ignorando configuraciones visuales.
        if ($academicSettingsChanged) {
            RunAcademicStatusAutoUpdater::dispatch();
        }

        return redirect()
            ->back()
            ->with('success', '¡Excelente! El calendario se ha actualizado correctamente.');
    }
}
