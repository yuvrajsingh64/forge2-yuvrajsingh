<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\SlaPolicy;
use App\Models\Ticket;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function metrics(): JsonResponse
    {
        $orgId = auth()->user()->organization_id;

        $byStatus = Ticket::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status');

        $byPriority = Ticket::select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->pluck('count', 'priority');

        $avgFirstResponse = DB::table('tickets')
            ->join('comments', 'tickets.id', '=', 'comments.ticket_id')
            ->where('tickets.organization_id', $orgId)
            ->where('comments.is_internal', false)
            ->select('tickets.id', DB::raw('MIN(comments.created_at) as first_response'))
            ->groupBy('tickets.id')
            ->get()
            ->avg(function ($row) {
                $ticket = Ticket::withoutGlobalScopes()->find($row->id);
                if (!$ticket) return null;
                return $ticket->created_at->diffInMinutes($row->first_response);
            });

        $openTickets = Ticket::whereIn('status', ['open', 'pending'])->get();
        $breachedCount = 0;

        foreach ($openTickets as $ticket) {
            $policy = SlaPolicy::where('organization_id', $orgId)
                ->where('priority', $ticket->priority)
                ->first();

            if ($policy && now()->gt($ticket->created_at->addMinutes($policy->resolution_minutes))) {
                $breachedCount++;
            }
        }

        $slaBreachRate = $openTickets->count() > 0
            ? round($breachedCount / $openTickets->count() * 100, 1)
            : 0;

        $dailyVolume = Ticket::select(
            DB::raw('DATE(created_at) as date'),
            DB::raw('count(*) as count')
        )
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'by_status' => $byStatus,
            'by_priority' => $byPriority,
            'avg_first_response_minutes' => round($avgFirstResponse ?? 0),
            'sla_breach_rate' => $slaBreachRate,
            'daily_volume' => $dailyVolume,
            'total_open' => ($byStatus['open'] ?? 0) + ($byStatus['pending'] ?? 0),
        ]);
    }
}
