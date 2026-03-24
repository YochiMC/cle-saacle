<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class EnrollStudentsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasAnyRole(['admin']);
    }

    public function rules(): array
    {
        return [
            'student_ids'   => 'required|array',
            'student_ids.*' => 'exists:students,id',
        ];
    }
}
