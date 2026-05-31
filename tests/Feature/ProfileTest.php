<?php

namespace Tests\Feature;

use App\Enums\DocumentStatus;
use App\Enums\DocumentType;
use App\Models\Document;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_page_is_displayed(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->get('/profile');

        $response->assertOk();
    }

    /**
     * @return array<string, array{0: string|null, 1: bool}>
     */
    public static function documentAccessProvider(): array
    {
        return [
            'teacher' => ['teacher', true],
            'student' => ['student', true],
            'admin' => ['admin', false],
            'coordinator' => ['coordinator', false],
            'user without role' => [null, false],
        ];
    }

    private function makeUser(?string $role = null): User
    {
        $user = User::factory()->create();

        if ($role !== null) {
            $user->assignRole($role);
        }

        return $user;
    }

    private function createDocumentFor(User $user): Document
    {
        return Document::create([
            'user_id' => $user->id,
            'type' => DocumentType::CURP->value,
            'original_name' => 'CURP_TEST.pdf',
            'file_path' => 'documents/test/CURP_TEST.pdf',
            'disk' => 'public',
            'status' => DocumentStatus::PENDING->value,
        ]);
    }

    /**
     * @dataProvider documentAccessProvider
     */
    public function test_profile_page_hides_document_section_for_non_document_roles(?string $role, bool $canManageDocuments): void
    {
        $user = $this->makeUser($role);

        if ($canManageDocuments) {
            $this->createDocumentFor($user);
        }

        $response = $this->actingAs($user)->get('/profile');

        $response
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Profile/User/Edit')
                ->where('canManageDocuments', $canManageDocuments)
            );

        if ($canManageDocuments) {
            $response->assertInertia(fn ($page) => $page
                ->has('documents', 1)
                ->has('documentTypes')
            );

            return;
        }

        $response->assertInertia(fn ($page) => $page
            ->where('documents', [])
            ->where('documentTypes', [])
        );
    }

    public function test_profile_information_can_be_updated(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => 'test@example.com',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $user->refresh();

        $this->assertSame('Test User', $user->name);
        $this->assertSame('test@example.com', $user->email);
        $this->assertNull($user->email_verified_at);
    }

    public function test_email_verification_status_is_unchanged_when_the_email_address_is_unchanged(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->patch('/profile', [
                'name' => 'Test User',
                'email' => $user->email,
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/profile');

        $this->assertNotNull($user->refresh()->email_verified_at);
    }

    public function test_user_can_delete_their_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->delete('/profile', [
                'password' => 'password',
            ]);

        $response
            ->assertSessionHasNoErrors()
            ->assertRedirect('/');

        $this->assertGuest();
        $this->assertSoftDeleted('users', ['id' => $user->id]);
    }

    public function test_correct_password_must_be_provided_to_delete_account(): void
    {
        $user = User::factory()->create();

        $response = $this
            ->actingAs($user)
            ->from('/profile')
            ->delete('/profile', [
                'password' => 'wrong-password',
            ]);

        $response
            ->assertSessionHasErrors('password')
            ->assertRedirect('/profile');

        $this->assertNotNull($user->fresh());
    }
}
