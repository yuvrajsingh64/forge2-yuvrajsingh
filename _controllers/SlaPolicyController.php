<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SlaPolicy;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SlaPolicyController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(SlaPolicy::all());
    }

    public function store(Request $request): JsonResponse
    {
        if (auth()->user()->role !== 'admin') {
            abort(403);
        }

        $data = $request->validate([
            'priority' => 'required|in:low,medium,high,urgent',
            'response_minutes' => 'required|integer|min:1',
            'resolution_minutes' => 'required|integer|min:1',
        ]);

        $policy = SlaPolicy::updateOrCreate(
            [
                'organization_id' => auth()->user()->organization_id,
                'priority' => $data['priority'],
            ],
            [
                'response_minutes' => $data['response_minutes'],
                'resolution_minutes' => $data['resolution_minutes'],
            ]
        );

        return response()->json($policy, 201);
    }
}
