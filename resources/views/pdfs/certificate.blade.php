<!DOCTYPE html>
<html>
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Certificate of Completion</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #fff;
        }
        .certificate {
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
            padding: 30px;
            box-sizing: border-box;
            border: 20px solid #e0e0e0;
            position: relative;
            background-color: #fff;
        }
        .border-pattern {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            border: 2px solid #999;
            margin: 10px;
            z-index: -1;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
        }
        .title {
            font-size: 36px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
            text-transform: uppercase;
            letter-spacing: 2px;
        }
        .subtitle {
            font-size: 24px;
            margin-bottom: 20px;
        }
        .content {
            text-align: center;
            margin-bottom: 40px;
        }
        .student-name {
            font-size: 32px;
            font-weight: bold;
            color: #333;
            margin-bottom: 20px;
            border-bottom: 2px solid #ccc;
            padding-bottom: 10px;
            display: inline-block;
        }
        .message {
            font-size: 18px;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .course-name {
            font-size: 24px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 30px;
        }
        .footer {
            display: flex;
            justify-content: space-between;
            margin-top: 60px;
        }
        .signature {
            text-align: center;
            flex: 1;
            padding: 0 20px;
        }
        .signature img {
            max-width: 200px;
            max-height: 80px;
        }
        .signature-line {
            border-top: 1px solid #333;
            width: 80%;
            margin: 10px auto;
        }
        .certificate-number {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 40px;
        }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 100px;
            opacity: 0.05;
            color: #000;
            z-index: -1;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="border-pattern"></div>
        <div class="watermark">EDUTRACK</div>
        
        <div class="header">
            <div class="title">Certificate of Completion</div>
            <div class="subtitle">This certifies that</div>
        </div>
        
        <div class="content">
            <div class="student-name">{{ $user->name }}</div>
            
            <div class="message">
                has successfully completed the course requirements and is awarded this certificate for
            </div>
            
            <div class="course-name">{{ $course->title }}</div>
            
            <div class="message">
                with a total of {{ $course->duration ?? '40' }} hours of instruction and practical work.
            </div>
        </div>
        
        <div class="footer">
            <div class="signature">
                <div class="signature-image">
                    @if($certificate->signature)
                        <img src="{{ storage_path('app/public/' . $certificate->signature) }}" alt="Instructor Signature">
                    @endif
                </div>
                <div class="signature-line"></div>
                <div class="signature-name">Course Instructor</div>
            </div>
            
            <div class="signature">
                <div class="signature-date">{{ $issueDate }}</div>
                <div class="signature-line"></div>
                <div class="signature-name">Date of Issue</div>
            </div>
        </div>
        
        <div class="certificate-number">
            Certificate ID: {{ $certificate->certificate_number }}
        </div>
    </div>
</body>
</html> 