<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OTP extends Model
{
    use \Illuminate\Database\Eloquent\Factories\HasFactory;

    protected $table = 'otps';

    protected $fillable = [
        'email',
        'otp',
        'type',
        'expires_at',
        'used_at'
    ];

    protected $casts = [
        'expires_at' => 'datetime',
        'used_at' => 'datetime',
    ];

    public function isExpired()
    {
        return $this->expires_at->isPast();
    }

    public function isUsed()
    {
        return !is_null($this->used_at);
    }
}

