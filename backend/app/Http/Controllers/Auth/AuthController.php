<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Services\OTPService;
use Illuminate\Support\Facades\Hash;
use Carbon\Carbon;

class AuthController extends Controller
{
    /**
     * Create a new AuthController instance.
     *
     * @return void
     */
    public function __construct()
    {
        $this->middleware('auth:api', ['except' => ['login', 'forgotPassword', 'resetPassword', 'verifyOTP', 'resendOTP']]);
    }

    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login(Request $request)
    {
        $credentials = $request->only(['email', 'password']);
        $expectedRole = $request->role;

        \Log::info('Login attempt', [
            'email' => $credentials['email'],
            'has_password' => !empty($credentials['password']),
            'expected_role' => $expectedRole
        ]);

        if (! $token = auth()->guard('api')->attempt($credentials)) {
            \Log::error('Authentication failed', ['email' => $credentials['email']]);
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $user = auth()->guard('api')->user();

        \Log::info('Authentication successful', ['user_id' => $user->id, 'role' => $user->role]);

        // Check if role matches if provided
        if ($expectedRole && $user->role !== $expectedRole) {
            auth()->guard('api')->logout();
            return response()->json(['error' => 'Access denied. Your account is not authorized for this role.'], 403);
        }

        if ($user->status === 'pending') {
            auth()->guard('api')->logout();
            return response()->json(['error' => 'Your account is pending activation. Please check your email for the activation link.'], 403);
        }

        if ($user->status !== 'active' || (isset($user->is_active) && !$user->is_active)) {
            auth()->guard('api')->logout();
            return response()->json(['error' => 'Your account is not active. Please contact the administrator.'], 403);
        }

        return $this->respondWithToken($token);
    }

    /**
     * Get the authenticated User.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function profile()
    {
        return response()->json(auth()->guard('api')->user());
    }

    /**
     * Log the user out (Invalidate the token).
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function logout()
    {
        auth()->guard('api')->logout();

        return response()->json(['message' => 'Successfully logged out']);
    }

    /**
     * Refresh a token.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function refresh()
    {
        return $this->respondWithToken(auth()->guard('api')->refresh());
    }

    /**
     * Update the authenticated user's profile.
     */
    public function updateProfile(Request $request)
    {
        $user = auth()->guard('api')->user();
        
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
        ]);

        $user->update($validated);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    /**
     * Update the authenticated user's password.
     */
    public function updatePassword(Request $request)
    {
        $user = auth()->guard('api')->user();

        $validated = $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ]);

        if (!\Illuminate\Support\Facades\Hash::check($validated['current_password'], $user->password)) {
            return response()->json(['error' => 'Current password does not match我们的记录.'], 422);
        }

        $user->update([
            'password' => $validated['new_password']
        ]);

        return response()->json(['message' => 'Password updated successfully']);
    }

    /**
     * Send OTP for Forgot Password
     */
    public function forgotPassword(Request $request, OTPService $otpService)
    {
        $request->validate(['email' => 'required|email']);
        
        $user = User::where('email', $request->email)->first();
        if (!$user) {
            return response()->json(['message' => 'If this email is in our system, you will receive an OTP.'], 200);
        }

        $otpService->sendOTP($user->email, 'password_reset');

        return response()->json(['message' => 'OTP sent to your email.']);
    }

    /**
     * Reset Password using OTP
     */
    public function resetPassword(Request $request, OTPService $otpService)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
            'password' => 'required|min:6|confirmed'
        ]);

        $isValid = $otpService->validateOTP($request->email, $request->otp, 'password_reset');

        if (!$isValid) {
            return response()->json(['error' => 'Invalid or expired OTP.'], 422);
        }

        $user = User::where('email', $request->email)->first();
        if ($user) {
            $user->update(['password' => $request->password]);
        }

        return response()->json(['message' => 'Password has been reset successfully.']);
    }

    /**
     * Verify OTP for Account Activation
     */
    public function verifyOTP(Request $request, OTPService $otpService)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string',
            'type' => 'required|string' // e.g., registration
        ]);

        $isValid = $otpService->validateOTP($request->email, $request->otp, $request->type);

        if (!$isValid) {
            return response()->json(['error' => 'Invalid or expired OTP.'], 422);
        }

        if ($request->type === 'registration' || $request->type === 'account_verification') {
            $user = User::where('email', $request->email)->first();
            if ($user) {
                $user->update(['email_verified_at' => Carbon::now(), 'is_active' => true]);
            }
        }

        return response()->json(['message' => 'OTP verified successfully.']);
    }

    /**
     * Resend OTP
     */
    public function resendOTP(Request $request, OTPService $otpService)
    {
        $request->validate([
            'email' => 'required|email',
            'type' => 'required|string'
        ]);

        $otpService->sendOTP($request->email, $request->type);

        return response()->json(['message' => 'A new OTP has been sent to your email.']);
    }

    /**
     * Get the token array structure.
     *
     * @param  string $token
     *
     * @return \Illuminate\Http\JsonResponse
     */
    protected function respondWithToken($token)
    {
        return response()->json([
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->guard('api')->factory()->getTTL() * 60,
            'user' => auth()->guard('api')->user()
        ]);
    }
}
