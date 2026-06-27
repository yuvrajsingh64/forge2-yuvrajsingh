<?php

namespace App\Policies;

use App\Models\Ticket;
use App\Models\User;

class TicketPolicy
{
    public function view(User $user, Ticket $ticket): bool
    {
        if ($user->organization_id !== $ticket->organization_id) {
            return false;
        }

        if ($user->role === 'customer') {
            return $ticket->requester_id === $user->id;
        }

        return true;
    }

    public function update(User $user, Ticket $ticket): bool
    {
        if ($user->organization_id !== $ticket->organization_id) {
            return false;
        }

        return in_array($user->role, ['admin', 'agent']);
    }

    public function delete(User $user, Ticket $ticket): bool
    {
        if ($user->organization_id !== $ticket->organization_id) {
            return false;
        }

        return $user->role === 'admin';
    }
}
