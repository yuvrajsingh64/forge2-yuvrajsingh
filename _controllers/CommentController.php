<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Comment;
use App\Models\Ticket;
use App\Services\ActivityLogger;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CommentController extends Controller
{
    public function index(int $ticketId): JsonResponse
    {
        $ticket = Ticket::findOrFail($ticketId);

        $this->authorize('view', $ticket);

        $query = Comment::with('user')->where('ticket_id', $ticketId);

        if (auth()->user()->role === 'customer') {
            $query->where('is_internal', false);
        }

        return response()->json($query->orderBy('created_at')->get());
    }

    public function store(Request $request, int $ticketId): JsonResponse
    {
        $ticket = Ticket::findOrFail($ticketId);

        $this->authorize('view', $ticket);

        $data = $request->validate([
            'body' => 'required|string',
            'is_internal' => 'boolean',
        ]);

        $isInternal = ($data['is_internal'] ?? false) && in_array(auth()->user()->role, ['admin', 'agent']);

        $comment = Comment::create([
            'ticket_id' => $ticketId,
            'user_id' => auth()->id(),
            'body' => $data['body'],
            'is_internal' => $isInternal,
        ]);

        ActivityLogger::record($ticketId, auth()->id(), 'comment_added', [
            'is_internal' => $isInternal,
        ]);

        if (!$isInternal) {
            $notifyUserId = auth()->id() === $ticket->requester_id
                ? $ticket->assignee_id
                : $ticket->requester_id;

            if ($notifyUserId) {
                NotificationService::notify($notifyUserId, 'ticket_replied', [
                    'ticket_id' => $ticket->id,
                    'subject' => $ticket->subject,
                ]);
            }
        }

        return response()->json($comment->load('user'), 201);
    }
}
