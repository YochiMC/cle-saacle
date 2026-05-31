<?php

namespace Tests\Feature;

use App\Models\Document;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Gate;
use Tests\TestCase;

class DocumentPolicyTest extends TestCase
{
    use RefreshDatabase;

    /**
     * @return array<string, array{0: string|null, 1: bool}>
     */
    public static function roleProvider(): array
    {
        return [
            'teacher' => ['teacher', true],
            'student' => ['student', true],
            'admin' => ['admin', false],
            'coordinator' => ['coordinator', false],
            'guest roleless user' => [null, false],
        ];
    }

    /**
     * @dataProvider roleProvider
     */
    public function test_only_teachers_and_students_can_create_documents(?string $role, bool $expected): void
    {
        $user = User::factory()->create();

        if ($role !== null) {
            $user->assignRole($role);
        }

        $this->assertSame($expected, Gate::forUser($user)->allows('create', Document::class));
    }
}