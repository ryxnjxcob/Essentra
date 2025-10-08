import smtplib
from email.mime.text import MIMEText

def send_reset_email(to_email: str, reset_token: str):
    reset_link = f"http://localhost:8000/reset-password?token={reset_token}"
    msg = MIMEText(f"Click the link to reset your password: {reset_link}")
    msg['Subject'] = "Password Reset"
    msg['From'] = "noreply@example.com"
    msg['To'] = to_email

    with smtplib.SMTP('smtp.gmail.com', 587) as server:
        server.starttls()
        server.login("your_email@gmail.com", "your_email_password")
        server.sendmail(msg['From'], [to_email], msg.as_string())
