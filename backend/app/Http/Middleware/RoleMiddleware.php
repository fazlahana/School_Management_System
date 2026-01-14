<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, $role): Response
    {
        $user = auth()->guard('api')->user();
        
        $userRole = $user ? trim($user->role) : 'null';
        $requiredRole = trim($role);
        $isMatch = ($userRole === $requiredRole);

        \Illuminate\Support\Facades\Log::debug('Role Check', [
            'user_id' => $user ? $user->id : 'none',
            'user_role' => $userRole,
            'required_role' => $requiredRole,
            'is_match' => $isMatch,
            'url' => $request->fullUrl(),
            'method' => $request->method()
        ]);

        if (!$user || !$isMatch) {
            return response()->json([
                'error' => 'Unauthorized',
                'debug' => [
                    'user_role' => $userRole,
                    'required_role' => $requiredRole
                ]
            ], 403);
        }

        return $next($request);
    }
}
