<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQualificationsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasAnyRole(['admin', 'teacher']);
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'qualifications' => 'required|array',
            'qualifications.*.qualification_id' => 'required|exists:qualifications,id',
            'qualifications.*.unit_1' => 'nullable|numeric|min:0|max:100',
            'qualifications.*.unit_2' => 'nullable|numeric|min:0|max:100',
            'qualifications.*.is_approved' => 'nullable|boolean',
            'qualifications.*.is_left' => 'nullable|boolean',
        ];
    }
}
