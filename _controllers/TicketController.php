<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ActivityLog;
use App\Models\Notification;
use App\Models\Ticket;
use App\Models\TicketTag;
use App\Services\ActivityLogger;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Ticket::with(['requester', 'assignee', 'tags']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('priority')) {
            $query->where('priority', $request->priority);
        }

        if ($request->filled('assignee_id')) {
            if ($request->assignee_id === 'unassigned') {
                $query->whereNull('assignee_id');
            } else {
                $query->where('assignee_id', $request->assignee_id);
            }
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if (auth()->user()->role === 'customer') {
            $query->where('requester_id', auth()->id());
        }

        $tickets = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($tickets);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'subject' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'in:low,medium,high,urgent',
            'assignee_id' => 'nullable|exists:users,id',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $ticket = Ticket::create([
            'subject' => $data['subject'],
            'description' => $data['description'],
            'priority' => $data['priority'] ?? 'medium',
            'assignee_id' => $data['assignee_id'] ?? null,
            'requester_id' => auth()->id(),
            'status' => 'open',
        ]);

        if (!empty($data['tags'])) {
            foreach ($data['tags'] as $tag) {
                TicketTag::create(['ticket_id' => $ticket->id, 'name' => $tag]);
            }
        }

        ActivityLogger::record($ticket->id, auth()->id(), 'ticket_created', [
            'subject' => $ticket->subject,
        ]);

        if ($ticket->assignee_id) {
            NotificationService::notify($ticket->assignee_id, 'ticket_assigned', [
                'ticket_id' => $ticket->id,
                'subject' => $ticket->subject,
            ]);
        }

        return response()->json($ticket->load(['requester', 'assignee', 'tags']), 201);
    }

    public function show(int $id): JsonResponse
    {
        $ticket = Ticket::with(['requester', 'assignee', 'tags', 'activityLogs.user'])->findOrFail($id);

        $this->authorize('view', $ticket);

        return response()->json($ticket);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        $this->authorize('update', $ticket);

        $data = $request->validate([
            'subject' => 'sometimes|string|max:255',
            'description' => 'sometimes|string',
            'status' => 'sometimes|in:open,pending,resolved,closed',
            'priority' => 'sometimes|in:low,medium,high,urgent',
            'assignee_id' => 'sometimes|nullable|exists:users,id',
            'tags' => 'sometimes|nullable|array',
            'tags.*' => 'string|max:50',
        ]);

        $oldStatus = $ticket->status;
        $oldAssignee = $ticket->assignee_id;

        $ticket->fill($data);
        $ticket->save();

        if (isset($data['status']) && $data['status'] !== $oldStatus) {
            ActivityLogger::record($ticket->id, auth()->id(), 'status_changed', [
                'from' => $oldStatus,
                'to' => $data['status'],
            ]);
        }

        if (array_key_exists('assignee_id', $data) && $data['assignee_id'] !== $oldAssignee) {
            ActivityLogger::record($ticket->id, auth()->id(), 'assignee_changed', [
                'from' => $oldAssignee,
                'to' => $data['assignee_id'],
            ]);

            if ($data['assignee_id']) {
                NotificationService::notify($data['assignee_id'], 'ticket_assigned', [
                    'ticket_id' => $ticket->id,
                    'subject' => $ticket->subject,
                ]);
            }
        }

        if (isset($data['tags'])) {
            $ticket->tags()->delete();
            foreach ($data['tags'] as $tag) {
                TicketTag::create(['ticket_id' => $ticket->id, 'name' => $tag]);
            }
        }

        return response()->json($ticket->load(['requester', 'assignee', 'tags']));
    }

    public function destroy(int $id): JsonResponse
    {
        $ticket = Ticket::findOrFail($id);

        $this->authorize('delete', $ticket);

        $ticket->delete();

        return response()->json(['message' => 'Ticket deleted.']);
    }
}
