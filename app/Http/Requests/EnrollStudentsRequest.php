<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EnrollStudentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        if (! $this->user()) {
            return false;
        }

        if ($this->user()->hasAnyRole(['admin', 'coordinator'])) {
            return true;
        }

        if (! $this->user()->hasRole('student')) {
            return false;
        }

        $studentId = $this->user()->student?->id;
        $studentIds = $this->input('student_ids', []);

        return is_array($studentIds)
            && count($studentIds) === 1
            && (int) ($studentIds[0] ?? 0) === (int) $studentId;
    }

    public function rules(): array
    {
        return [
            'student_ids'   => 'required|array',
            'student_ids.*' => 'exists:students,id',
        ];
    }
}
