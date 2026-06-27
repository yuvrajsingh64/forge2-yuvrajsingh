<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends Model
{
    use BelongsToTenant;

    protected $fillable = [
        'organization_id',
        'subject',
        'description',
        'status',
        'priority',
        'requester_id',
        'assignee_id',
    ];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }

    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requester_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(Comment::class);
    }

    public function tags(): HasMany
    {
        return $this->hasMany(TicketTag::class);
    }

    public function activityLogs(): HasMany
    {
        return $this->hasMany(ActivityLog::class);
    }

    public function getSlaStatusAttribute(): array
    {
        $policy = SlaPolicy::where('organization_id', $this->organization_id)
            ->where('priority', $this->priority)
            ->first();

        if (!$policy) {
            return ['has_sla' => false];
        }

        $resolutionDeadline = $this->created_at->addMinutes($policy->resolution_minutes);
        $responseDeadline = $this->created_at->addMinutes($policy->response_minutes);
        $now = now();

        return [
            'has_sla' => true,
            'response_deadline' => $responseDeadline->toIso8601String(),
            'resolution_deadline' => $resolutionDeadline->toIso8601String(),
            'response_breached' => $now->gt($responseDeadline),
            'resolution_breached' => in_array($this->status, ['open', 'pending']) && $now->gt($resolutionDeadline),
            'minutes_until_resolution' => $now->lt($resolutionDeadline) ? $now->diffInMinutes($resolutionDeadline) : 0,
        ];
    }

    protected $appends = ['sla_status'];
}
