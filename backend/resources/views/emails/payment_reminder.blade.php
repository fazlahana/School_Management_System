<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f4f7fa; color: #333; }
        .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
        .header { background: #4f46e5; color: white; padding: 40px; text-align: center; }
        .content { padding: 40px; line-height: 1.6; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .btn { display: inline-block; background: #4f46e5; color: white; padding: 15px 30px; border-radius: 12px; text-decoration: none; font-weight: bold; margin-top: 20px; }
        .stats { background: #f3f4f6; border-radius: 16px; padding: 20px; margin: 20px 0; }
    </style>
</head>
<body>
    <div className="container">
        <div className="header">
            <h1 style="margin:0">Action Required</h1>
            <p style="opacity:0.9">Payment Reminder - {{ \App\Models\Setting::get('school_name', 'School System') }}</p>
        </div>
        <div className="content">
            <h2>Hello {{ $invoice->student->user->name }},</h2>
            <p>This is a friendly reminder regarding your outstanding invoice <strong>{{ $invoice->invoice_number }}</strong>.</p>
            
            <div className="stats">
                <p style="margin:0; font-size:12px; font-weight:bold; color:#666; text-transform:uppercase;">Balance Due</p>
                <h1 style="margin:5px 0; color:#e11d48; font-size:32px;">{{ \App\Models\Setting::get('currency_symbol', '$') }}{{ number_format($invoice->due_amount, 2) }}</h1>
                <p style="margin:0; font-size:14px;"><strong>Due Date:</strong> {{ date('F j, Y', strtotime($invoice->due_date)) }}</p>
            </div>

            <p>Please log in to your student dashboard to settle the remaining balance or visit the school accounts office.</p>
            
            <a href="{{ config('app.url') }}" className="btn">View My Dashboard</a>

            <p style="margin-top:30px; font-size:14px; color:#666;">If you have already made this payment, please disregard this email. Thank you for your cooperation.</p>
        </div>
        <div className="footer">
            <p>&copy; {{ date('Y') }} {{ \App\Models\Setting::get('school_name', 'School System') }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
