<?php

use App\Models\Organization;
use App\Models\Ticket;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

beforeEach(function () {
    $this->orgA = Organization::create(['name' => 'Org A', 'slug' => 'org-a']);
    $this->orgB = Organization::create(['name' => 'Org B', 'slug' => 'org-b']);

    $this->userA = User::create([
        'organization_id' => $this->orgA->id,
        'name' => 'User A',
        'email' => 'user@orga.com',
        'password' => bcrypt('password'),
        'role' => 'agent',
    ]);

    $this->userB = User::create([
        'organization_id' => $this->orgB->id,
        'name' => 'User B',
        'email' => 'user@orgb.com',
        'password' => bcrypt('password'),
        'role' => 'agent',
    ]);

    $this->ticketB = Ticket::withoutGlobalScopes()->create([
        'organization_id' => $this->orgB->id,
        'subject' => 'Org B Private Ticket',
        'description' => 'This belongs to Org B only.',
        'status' => 'open',
        'priority' => 'medium',
        'requester_id' => $this->userB->id,
    ]);
});

it('blocks org a user from listing org b tickets', function () {
    $response = $this->actingAs($this->userA, 'sanctum')
        ->getJson('/api/tickets');

    $response->assertOk();
    $ids = collect($response->json('data'))->pluck('id');
    expect($ids)->not->toContain($this->ticketB->id);
});

it('blocks org a user from viewing org b ticket directly', function () {
    $response = $this->actingAs($this->userA, 'sanctum')
        ->getJson('/api/tickets/' . $this->ticketB->id);

    $response->assertForbidden();
});

it('blocks org a user from updating org b ticket', function () {
    $response = $this->actingAs($this->userA, 'sanctum')
        ->putJson('/api/tickets/' . $this->ticketB->id, ['status' => 'closed']);

    $response->assertForbidden();
});

it('blocks org a admin from deleting org b ticket', function () {
    $adminA = User::create([
        'organization_id' => $this->orgA->id,
        'name' => 'Admin A',
        'email' => 'admin@orga.com',
        'password' => bcrypt('password'),
        'role' => 'admin',
    ]);

    $response = $this->actingAs($adminA, 'sanctum')
        ->deleteJson('/api/tickets/' . $this->ticketB->id);

    $response->assertForbidden();
    $this->assertDatabaseHas('tickets', ['id' => $this->ticketB->id]);
});
