<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = $request->user()->notifications()->paginate(20);
        $unreadCount = $request->user()->unreadNotifications()->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count' => $unreadCount
        ]);
    }

    public function markAsRead(Request $request, $id)
    {
        $notification = $request->user()->notifications()->where('id', $id)->first();
        
        if ($notification) {
            $notification->markAsRead();
            return response()->json(['message' => 'Notification marked as read']);
        }

        return response()->json(['message' => 'Notification not found'], 404);
    }

    public function markAllAsRead(Request $request)
    {
        $request->user()->unreadNotifications->markAsRead();
        return response()->json(['message' => 'All notifications marked as read']);
    }

    public function sendCustomNotification(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'title' => 'required|string|max:255',
            'message' => 'required|string',
            'type' => 'nullable|string|in:info,success,warning,error'
        ]);

        $user = \App\Models\User::find($validated['user_id']);
        
        $notificationData = [
            'title' => $validated['title'],
            'message' => $validated['message'],
            'type' => $validated['type'] ?? 'info',
            'link' => null
        ];

        $user->notify(new \App\Notifications\SystemNotification($notificationData));

        return response()->json(['message' => 'Notification sent successfully']);
    }

    public function testNotification(Request $request)
    {
        $notificationData = [
            'title' => 'Test Notification',
            'message' => 'This is a test notification generated at ' . now()->toDateTimeString(),
            'type' => 'success',
            'link' => '/admin/notifications'
        ];

        $request->user()->notify(new \App\Notifications\SystemNotification($notificationData));

        return response()->json(['message' => 'Test notification sent! Check your bell icon.']);
    }
}
