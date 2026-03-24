<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EnrollStudentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return auth()->check();
    }

    public function rules(): array
    {
        return [
            'student_ids'   => 'required|array',
            'student_ids.*' => 'exists:students,id',
        ];
    }
}
