<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ResolveTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        if (auth()->check()) {
            $organizationId = auth()->user()->organization_id;
            $request->attributes->set('organization_id', $organizationId);
        }

        return $next($request);
    }
}
