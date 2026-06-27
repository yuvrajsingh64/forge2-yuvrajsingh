<?php

use App\Models\Organization;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->org = Organization::create(['name' => 'Test Org', 'slug' => 'test-org']);

    $this->admin = User::create([
        'organization_id' => $this->org->id,
        'name' => 'Admin',
        'email' => 'admin@test.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $this->agent = User::create([
        'organization_id' => $this->org->id,
        'name' => 'Agent',
        'email' => 'agent@test.com',
        'password' => bcrypt('password'),
        'role' => 'agent',
    ]);

    $this->customer = User::create([
        'organization_id' => $this->org->id,
        'name' => 'Customer',
        'email' => 'customer@test.com',
        'password' => bcrypt('password'),
        'role' => 'customer',
    ]);
});

it('allows a customer to create a ticket', function () {
    $response = $this->actingAs($this->customer, 'sanctum')
        ->postJson('/api/tickets', [
            'subject' => 'Help with login',
            'description' => 'I cannot log in to my account.',
            'priority' => 'high',
        ]);

    $response->assertCreated();
    $response->assertJsonPath('subject', 'Help with login');
    $this->assertDatabaseHas('tickets', ['subject' => 'Help with login', 'organization_id' => $this->org->id]);
});

it('allows an agent to update ticket status', function () {
    $ticket = Ticket::withoutGlobalScopes()->create([
        'organization_id' => $this->org->id,
        'subject' => 'Original subject',
        'description' => 'Some description.',
        'status' => 'open',
        'priority' => 'medium',
        'requester_id' => $this->customer->id,
    ]);

    $response = $this->actingAs($this->agent, 'sanctum')
        ->putJson('/api/tickets/' . $ticket->id, ['status' => 'pending']);

    $response->assertOk();
    $response->assertJsonPath('status', 'pending');
});

it('blocks a customer from updating ticket status', function () {
    $ticket = Ticket::withoutGlobalScopes()->create([
        'organization_id' => $this->org->id,
        'subject' => 'My ticket',
        'description' => 'Description.',
        'status' => 'open',
        'priority' => 'low',
        'requester_id' => $this->customer->id,
    ]);

    $response = $this->actingAs($this->customer, 'sanctum')
        ->putJson('/api/tickets/' . $ticket->id, ['status' => 'closed']);

    $response->assertForbidden();
});

it('allows only admin to delete a ticket', function () {
    $ticket = Ticket::withoutGlobalScopes()->create([
        'organization_id' => $this->org->id,
        'subject' => 'To be deleted',
        'description' => 'Description.',
        'status' => 'open',
        'priority' => 'low',
        'requester_id' => $this->customer->id,
    ]);

    $this->actingAs($this->agent, 'sanctum')
        ->deleteJson('/api/tickets/' . $ticket->id)
        ->assertForbidden();

    $this->actingAs($this->admin, 'sanctum')
        ->deleteJson('/api/tickets/' . $ticket->id)
        ->assertOk();

    $this->assertDatabaseMissing('tickets', ['id' => $ticket->id]);
});

it('requires authentication to access tickets', function () {
    $this->getJson('/api/tickets')->assertUnauthorized();
});

it('lists only org tickets for authenticated user', function () {
    Ticket::withoutGlobalScopes()->create([
        'organization_id' => $this->org->id,
        'subject' => 'Org ticket',
        'description' => 'Desc',
        'status' => 'open',
        'priority' => 'medium',
        'requester_id' => $this->customer->id,
    ]);

    $response = $this->actingAs($this->agent, 'sanctum')
        ->getJson('/api/tickets');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
});
