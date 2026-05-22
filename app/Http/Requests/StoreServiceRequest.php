<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\ServiceType;
use App\Models\Service;
use App\Enums\ServiceStatus;
use App\Services\PeriodActivationService;

/**
 * Valida la creación de un nuevo registro de servicio o pago de alumno.
 *
 * Segunda capa de seguridad: valida que el usuario autenticado sea estudiante
 * antes de que el controlador invoque la policy.
 */
class StoreServiceRequest extends FormRequest
{
    /**
     * Determina si el usuario está autorizado para realizar esta solicitud.
     *
     * Solo estudiantes pueden crear servicios (subir comprobantes de pago).
     */
    public function authorize(): bool
    {
        return $this->user()?->hasRole('student') ?? false;
    }

    /**
     * Obtiene las reglas de validación aplicables a la solicitud.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $serviceTypeValues = array_column(ServiceType::toSelect(), 'value');

        return [
            'file'             => ['required', 'file', 'mimes:pdf', 'max:5120'],
            'type'             => ['required', 'string', Rule::in($serviceTypeValues)],
            'amount'           => ['required', 'numeric', 'min:0'],
            'reference_number' => ['nullable', 'string', 'max:255'],
            'description'      => ['nullable', 'string'],
        ];
    }

    /**
     * Añade validaciones adicionales después de las reglas básicas.
     * Evita que un estudiante suba un comprobante del mismo tipo si ya tiene
     * uno `PENDING` o `APPROVED` en el periodo activo.
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $user = $this->user();
            $studentId = $user?->student?->id;
            $type = $this->input('type');

            if (! $studentId || ! $type) {
                return;
            }

            $activePeriod = app(PeriodActivationService::class)->syncForDate(now());
            if (! $activePeriod) {
                return;
            }

            $exists = Service::where('student_id', '=', $studentId)
                ->where('type', '=', $type)
                ->whereIn('status', [ServiceStatus::PENDING->value, ServiceStatus::APPROVED->value])
                ->where(function ($q) use ($activePeriod) {
                    $q->where('period_id', '=', $activePeriod->id)
                        ->orWhereNull('period_id');
                })
                ->exists();

            if ($exists) {
                $validator->errors()->add('type', 'Ya existe un comprobante del mismo concepto en revisión o aprobado para este periodo activo.');
            }

            // reattempt flow removed: students should delete rejected service and upload a new one
        });
    }

    /**
     * Mensajes de error personalizados para la validación.
     */
    public function messages(): array
    {
        return [
            'file.required'       => 'El comprobante de pago es obligatorio.',
            'file.mimes'          => 'El comprobante debe ser un archivo PDF.',
            'file.max'            => 'El comprobante no debe superar los 5 MB.',
            'type.required'       => 'Debes seleccionar un concepto de pago.',
            'type.in'             => 'El concepto seleccionado no es válido.',
            'amount.required'     => 'El monto es obligatorio.',
            'amount.numeric'      => 'El monto debe ser numérico.',
        ];
    }
}
