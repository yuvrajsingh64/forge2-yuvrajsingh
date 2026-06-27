<?php

namespace App\Services;

use App\Models\ActivityLog;

class ActivityLogger
{
    public static function record(int $ticketId, ?int $userId, string $action, array $metadata = []): void
    {
        ActivityLog::create([
            'ticket_id' => $ticketId,
            'user_id' => $userId,
            'action' => $action,
            'metadata' => $metadata,
            'created_at' => now(),
        ]);
    }
}
