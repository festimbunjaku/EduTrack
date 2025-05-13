<!DOCTYPE html>
<html>
<head>
    <title>Certificate of Completion</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            color: #333;
            text-align: center;
            margin: 0;
            padding: 0;
            background-color: #f9f9f9;
            background-size: cover;
            width: 100%;
            height: 100%;
        }
        .certificate {
            position: relative;
            width: 100%;
            height: 100%;
            padding: 20px;
            box-sizing: border-box;
            border: 20px solid #3a0ca3;
            background-color: white;
            max-width: 1000px;
            margin: 0 auto;
        }
        .title {
            font-size: 48px;
            margin-top: 50px;
            color: #3a0ca3;
            font-weight: bold;
        }
        .subtitle {
            font-size: 28px;
            margin: 20px 0;
        }
        .name {
            font-size: 36px;
            margin: 30px 0;
            font-weight: bold;
            color: #3a0ca3;
            border-bottom: 2px solid #3a0ca3;
            display: inline-block;
            padding: 0 20px 5px;
        }
        .course {
            font-size: 24px;
            margin: 20px 0;
            font-weight: bold;
        }
        .date {
            font-size: 20px;
            margin: 30px 0;
        }
        .achievement {
            font-size: 22px;
            margin: 25px 0;
            font-style: italic;
            color: #555;
        }
        .signature-area {
            margin-top: 60px;
            display: flex;
            justify-content: center;
        }
        .signature {
            border-top: 1px solid #333;
            padding-top: 5px;
            width: 200px;
            margin: 0 20px;
            text-align: center;
        }
        .certificate-number {
            position: absolute;
            bottom: 20px;
            left: 0;
            right: 0;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="certificate">
        <div class="title">Certificate of Completion</div>
        <div class="subtitle">This certifies that</div>
        <div class="name">@{{ student_name }}</div>
        <div class="subtitle">has successfully completed the course</div>
        <div class="course">@{{ course_title }}</div>
        <div class="achievement">@{{ achievement }}</div>
        <div class="date">Completed on @{{ completion_date }}</div>
        
        <div class="signature-area">
            <div class="signature">
                <img src="@{{ signature_image }}" height="50" />
                <div>@{{ issuer_name }}</div>
                <div>Instructor</div>
            </div>
        </div>
        
        <div class="certificate-number">Certificate #@{{ certificate_number }}</div>
    </div>
</body>
</html> 