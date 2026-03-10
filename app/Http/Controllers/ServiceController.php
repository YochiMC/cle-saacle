<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Service;

class ServiceController extends Controller
{
    //
    public function createService(Request $request): void
    {
        $validate = $request->validate([
            'type' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'status' => 'required|string|max:255',
            'description' => 'nullable|string',
            'reference_number' => 'nullable|string|max:255',
            'file_path' => 'nullable|string|max:255',
            'student_id' => 'required|exists:students,id',
        ]);

        $service = Service::create($validate);
    }

    public function getServices(): void
    {
        $services = Service::all();
    }

    public function updateService(Service $service, Request $request): void
    {
        $validate = $request->validate([
            'type' => 'required|string|max:255',
            'amount' => 'required|numeric',
            'status' => 'required|string|max:255',
            'description' => 'nullable|string',
            'reference_number' => 'nullable|string|max:255',
            'file_path' => 'nullable|string|max:255',
            'student_id' => 'required|exists:students,id',
        ]);

        $service->update($validate);
    }

    public function deleteService(Service $service): void
    {
        $service->delete();
    }
}
