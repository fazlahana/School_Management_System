<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use App\Notifications\VerifyOtpNotification;
use Tymon\JWTAuth\Facades\JWTAuth;

class VerificationController extends Controller
{
    public function verifyToken($token)
    {
        $user = User::where('verify_token', $token)
            ->where('verify_token_expires_at', '>', now())
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid or expired verification token.'], 400);
        }

        if ($user->status !== 'pending') {
            return response()->json(['message' => 'Account is already verified or active.'], 400);
        }

        return response()->json([
            'message' => 'Token validated successfully.',
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ]
        ]);
    }

    public function setPassword(Request $request)
    {
        $request->validate([
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('verify_token', $request->token)
            ->where('verify_token_expires_at', '>', now())
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid or expired verification token.'], 400);
        }

        DB::beginTransaction();
        try {
            // Generate OTP
            $otp = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);
            
            $user->update([
                'password' => $request->password,
                'otp' => $otp,
                'otp_expires_at' => now()->addMinutes(5),
                'verify_token' => null, // Clear token after use
                'verify_token_expires_at' => null,
            ]);

            DB::commit();

            // Send OTP Email
            $user->notify(new VerifyOtpNotification($otp));

            return response()->json(['message' => 'Password set successfully. Verification OTP has been sent to your email.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to set password.', 'error' => $e->getMessage()], 500);
        }
    }

    public function verifyOtp(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
        ]);

        $user = User::where('email', $request->email)
            ->where('otp', $request->otp)
            ->where('otp_expires_at', '>', now())
            ->first();

        if (!$user) {
            return response()->json(['message' => 'Invalid or expired OTP.'], 400);
        }

        DB::beginTransaction();
        try {
            $user->update([
                'status' => 'active',
                'email_verified_at' => now(),
                'otp' => null,
                'otp_expires_at' => null,
            ]);

            DB::commit();

            // Auto login
            $token = JWTAuth::fromUser($user);

            return response()->json([
                'message' => 'Account activated successfully.',
                'token' => $token,
                'user' => $user,
                'role' => $user->role
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Activation failed.', 'error' => $e->getMessage()], 500);
        }
    }
}
