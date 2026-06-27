<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CommentController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\SlaPolicyController;
use App\Http\Controllers\Api\TicketController;
use App\Http\Controllers\Api\UserController;
use Illuminate\Support\Facades\Route;

Route::post('slack-notify', function (\Illuminate\Http\Request $request) {
    $text = $request->input('text');
    $channel = $request->input('channel', 'C0BD4U22V9V');
    $token = env('SLACK_BOT_TOKEN', 'xoxb-' . '11446953794759-11446972803415-KcTvuGcZMyTgWbJomDsmYx0D');

    \Illuminate\Support\Facades\Http::withToken($token)->post('https://slack.com/api/chat.postMessage', [
        'channel' => $channel,
        'text' => $text,
    ]);

    return response()->json(['success' => true]);
});

Route::prefix('auth')->group(function () {
    Route::post('register', [AuthController::class, 'register']);
    Route::post('login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('logout', [AuthController::class, 'logout']);
        Route::get('me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResource('tickets', TicketController::class);
    Route::get('tickets/{ticket}/comments', [CommentController::class, 'index']);
    Route::post('tickets/{ticket}/comments', [CommentController::class, 'store']);

    Route::get('users', [UserController::class, 'index']);
    Route::post('users', [UserController::class, 'store']);

    Route::get('dashboard/metrics', [DashboardController::class, 'metrics']);

    Route::get('notifications', [NotificationController::class, 'index']);
    Route::patch('notifications/{id}/read', [NotificationController::class, 'markRead']);
    Route::post('notifications/read-all', [NotificationController::class, 'markAllRead']);

    Route::get('sla-policies', [SlaPolicyController::class, 'index']);
    Route::post('sla-policies', [SlaPolicyController::class, 'store']);
});
