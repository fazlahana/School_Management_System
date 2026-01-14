<?php

namespace App\Services;

use App\Models\OTP;
use App\Models\User;
use App\Notifications\SendOTPNotification;
use App\Notifications\AccountVerificationNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;

class OTPService
{
    /**
     * Generate and send OTP to a user.
     *
     * @param string $email
     * @param string $type
     * @param int $expiryMinutes
     * @return void
     */
    public function sendOTP($email, $type, $expiryMinutes = 10)
    {
        // 1. Invalidate previous unused OTPs of the same type
        OTP::where('email', $email)
            ->where('type', $type)
            ->whereNull('used_at')
            ->update(['expires_at' => Carbon::now()]);

        // 2. Generate secure 6-digit OTP
        $otpCode = (string) random_int(100000, 999999);

        // 3. Store hashed OTP in database for security
        OTP::create([
            'email' => $email,
            'otp' => Hash::make($otpCode), 
            'type' => $type,
            'expires_at' => Carbon::now()->addMinutes($expiryMinutes),
        ]);

        // 4. Determine which notification to send
        $notification = ($type === 'registration' || $type === 'account_verification') 
            ? new AccountVerificationNotification($otpCode)
            : new SendOTPNotification($otpCode, $type);

        // 5. Send Notification
        $user = User::where('email', $email)->first();
        if ($user) {
            $user->notify($notification);
        } else {
            Notification::route('mail', $email)->notify($notification);
        }
    }

    /**
     * Validate an OTP.
     *
     * @param string $email
     * @param string $otpCode
     * @param string $type
     * @return bool
     */
    public function validateOTP($email, $otpCode, $type)
    {
        // Fetch only valid, unused OTPs for this email and type
        $otps = OTP::where('email', $email)
            ->where('type', $type)
            ->whereNull('used_at')
            ->where('expires_at', '>', Carbon::now())
            ->orderBy('created_at', 'desc')
            ->get();

        foreach ($otps as $otpRecord) {
            if (Hash::check($otpCode, $otpRecord->otp)) {
                // Mark as used
                $otpRecord->update(['used_at' => Carbon::now()]);
                
                // Invalidate all other pending OTPs for this purpose
                OTP::where('email', $email)
                    ->where('type', $type)
                    ->whereNull('used_at')
                    ->update(['expires_at' => Carbon::now()]);

                return true;
            }
        }

        return false;
    }
}

