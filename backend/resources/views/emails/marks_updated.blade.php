<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px; }
        .header { background: #10b981; color: white; padding: 15px; text-align: center; border-radius: 10px 10px 0 0; }
        .details { margin: 20px 0; padding: 15px; background: #f0fdf4; border-radius: 8px; text-align: center; }
        .score { font-size: 2em; font-weight: bold; color: #059669; }
        .footer { font-size: 0.8em; color: #666; text-align: center; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h2>Exam Results Published</h2>
        </div>
        <p>Hello <strong>{{ $result->student->user->name }}</strong>,</p>
        <p>Your results for the following exam have been published:</p>
        
        <div class="details">
            <p><strong>{{ $result->exam->title }}</strong></p>
            <p>Subject: {{ $result->exam->subject->name }}</p>
            <div class="score">{{ $result->marks_obtained }} / {{ $result->exam->total_marks }}</div>
            <p>Grade: <strong>{{ $result->grade }}</strong></p>
        </div>

        @if($result->remarks)
            <p><strong>Teacher's Remarks:</strong> {{ $result->remarks }}</p>
        @endif

        <p>You can view your detailed performance report on the student dashboard.</p>
        
        <div class="footer">
            &copy; {{ date('Y') }} EduSpire School Management System
        </div>
    </div>
</body>
</html>
