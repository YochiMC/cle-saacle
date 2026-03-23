<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQualificationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return auth()->check();
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'unit_1'        => 'nullable|numeric|min:0|max:100',
            'unit_2'        => 'nullable|numeric|min:0|max:100',
            'is_approved'  => 'nullable|boolean',
            'is_left'      => 'nullable|boolean',
        ];
    }
}
