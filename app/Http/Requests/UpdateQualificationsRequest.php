<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use App\Enums\AttemptEnum;
use App\Enums\AcademicStatus;

class UpdateQualificationsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        $user = $this->user();
        if (!$user) return false;

        if ($user->hasAnyRole(['admin', 'coordinator'])) {
            return true;
        }

        if ($user->hasRole('teacher')) {
            $qualification = $this->route('qualification');
            return $qualification && $qualification->group?->teacher_id === $user->teacher?->id
                && $qualification->group?->status === AcademicStatus::GRADING;
        }

        return false;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        // El mismo FormRequest se usa para dos contratos:
        // 1) Guardado masivo: { qualifications: [...] }
        // 2) Guardado individual: { units_breakdown, final_average, is_left }
        if ($this->has('qualifications')) {
            return [
                'qualifications' => 'required|array',
                'qualifications.*.qualification_id' => 'required|exists:qualifications,id',
                'qualifications.*.units_breakdown' => 'nullable|array',
                'qualifications.*.units_breakdown.*' => 'nullable',
                'qualifications.*.final_average' => 'required',
                'qualifications.*.is_left' => 'nullable|boolean',
                'qualifications.*.attempt' => ['required', Rule::enum(AttemptEnum::class)],
            ];
        }

        return [
            'units_breakdown' => 'nullable|array',
            'units_breakdown.*' => 'nullable',
            'final_average' => 'required',
            'is_left' => 'nullable|boolean',
            'attempt' => ['required', Rule::enum(AttemptEnum::class)],
        ];
    }
}
