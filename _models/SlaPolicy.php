<?php

namespace App\Models;

use App\Models\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SlaPolicy extends Model
{
    use BelongsToTenant;

    protected $fillable = ['organization_id', 'priority', 'response_minutes', 'resolution_minutes'];

    public function organization(): BelongsTo
    {
        return $this->belongsTo(Organization::class);
    }
}
