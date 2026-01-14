<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { background: #4f46e5; color: white; padding: 15px; text-align: center; border-radius: 10px 10px 0 0; }
        .details { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
        .footer { font-size: 0.8em; color: #666; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>{{ $type === 'scheduled' ? 'New Exam Scheduled' : 'Exam Schedule Updated' }}</h2>
        </div>
        <p>Hello,</p>
        <p>A new exam has been {{ $type === 'scheduled' ? 'scheduled' : 'updated' }} for your class.</p>
        
        <div class="details">
            <p><strong>Exam:</strong> {{ $exam->title }}</p>
            <p><strong>Subject:</strong> {{ $exam->subject->name }}</p>
            <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($exam->exam_date)->format('M d, Y') }}</p>
            <p><strong>Time:</strong> {{ \Carbon\Carbon::parse($exam->start_time)->format('h:i A') }} - {{ \Carbon\Carbon::parse($exam->end_time)->format('h:i A') }}</p>
            <p><strong>Location:</strong> {{ $exam->location }}</p>
        </div>

        <p>Please make sure to prepare accordingly. You can view full details on your student dashboard.</p>
        
        <p>Good luck!</p>
        <div class="footer">
            &copy; {{ date('Y') }} EduSpire School Management System
        </div>
    </div>
</body>
</html>
