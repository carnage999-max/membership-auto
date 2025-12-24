"""Email utilities for user-related communications using Resend"""

from resend import Resend
from django.conf import settings
import os


# Initialize Resend client
resend_client = Resend(api_key=os.getenv("RESEND_API_KEY", ""))


def send_welcome_email(user_email, user_name=None):
    """Send welcome email to new user"""
    if not resend_client.api_key:
        print("RESEND_API_KEY not configured. Skipping email send.")
        return False
    
    try:
        resend_client.emails.send({
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": user_email,
            "subject": "Welcome to Membership Auto!",
            "html": f"""
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
                        <h1 style="color: #CBA86E;">Welcome to Membership Auto!</h1>
                        <p>Hi {user_name or user_email.split('@')[0]},</p>
                        <p>Thank you for signing up! You're now part of the Membership Auto community.</p>
                        
                        <h2 style="color: #CBA86E; margin-top: 30px;">Next Steps:</h2>
                        <ol>
                            <li>Add your vehicle information</li>
                            <li>Choose a membership plan</li>
                            <li>Start saving on repairs and maintenance!</li>
                        </ol>
                        
                        <p style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px;">
                            <strong>Need help?</strong> Contact our support team at support@membershipauto.com
                        </p>
                        
                        <p style="color: #777; font-size: 12px; margin-top: 20px;">
                            This is an automated message from Membership Auto. Please do not reply to this email.
                        </p>
                    </div>
                </body>
            </html>
            """
        })
        return True
    except Exception as e:
        print(f"Failed to send welcome email to {user_email}: {str(e)}")
        return False


def send_membership_confirmation_email(user_email, user_name, plan_name, amount, renewal_date):
    """Send confirmation email after successful membership purchase"""
    if not resend_client.api_key:
        print("RESEND_API_KEY not configured. Skipping email send.")
        return False
    
    try:
        resend_client.emails.send({
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": user_email,
            "subject": f"Membership Confirmed - {plan_name} Plan",
            "html": f"""
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
                        <h1 style="color: #CBA86E;">Membership Confirmed!</h1>
                        <p>Hi {user_name or user_email.split('@')[0]},</p>
                        <p>Your membership has been successfully activated.</p>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="color: #CBA86E; margin-top: 0;">Membership Details</h3>
                            <p><strong>Plan:</strong> {plan_name}</p>
                            <p><strong>Monthly Fee:</strong> ${amount:.2f}</p>
                            <p><strong>Next Renewal:</strong> {renewal_date}</p>
                        </div>
                        
                        <p>You now have access to all benefits of your {plan_name} plan, including discounts on maintenance and repairs.</p>
                        
                        <p style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px;">
                            <strong>Questions?</strong> Contact our support team at support@membershipauto.com
                        </p>
                        
                        <p style="color: #777; font-size: 12px; margin-top: 20px;">
                            This is an automated message from Membership Auto. Please do not reply to this email.
                        </p>
                    </div>
                </body>
            </html>
            """
        })
        return True
    except Exception as e:
        print(f"Failed to send membership confirmation email to {user_email}: {str(e)}")
        return False


def send_password_reset_email(user_email, reset_token, user_name=None):
    """Send password reset email with reset link"""
    if not resend_client.api_key:
        print("RESEND_API_KEY not configured. Skipping email send.")
        return False
    
    reset_url = f"{settings.FRONTEND_URL}/auth/reset-password?token={reset_token}"
    
    try:
        resend_client.emails.send({
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": user_email,
            "subject": "Reset Your Membership Auto Password",
            "html": f"""
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
                        <h1 style="color: #CBA86E;">Password Reset Request</h1>
                        <p>Hi {user_name or user_email.split('@')[0]},</p>
                        <p>We received a request to reset your Membership Auto password. Click the button below to reset it.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="{reset_url}" style="background-color: #CBA86E; color: #0d0d0d; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                Reset Password
                            </a>
                        </div>
                        
                        <p style="color: #777; font-size: 12px;">
                            Or copy and paste this link in your browser:<br>
                            {reset_url}
                        </p>
                        
                        <p style="color: #d9534f; margin-top: 30px;">
                            This link will expire in 24 hours for security reasons.
                        </p>
                        
                        <p style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px;">
                            If you didn't request a password reset, you can ignore this email.
                        </p>
                        
                        <p style="color: #777; font-size: 12px; margin-top: 20px;">
                            This is an automated message from Membership Auto. Please do not reply to this email.
                        </p>
                    </div>
                </body>
            </html>
            """
        })
        return True
    except Exception as e:
        print(f"Failed to send password reset email to {user_email}: {str(e)}")
        return False


def send_appointment_confirmation_email(user_email, user_name, appointment_details):
    """Send appointment confirmation email"""
    if not resend_client.api_key:
        print("RESEND_API_KEY not configured. Skipping email send.")
        return False
    
    try:
        resend_client.emails.send({
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": user_email,
            "subject": f"Appointment Confirmed - {appointment_details.get('service_type', 'Service')}",
            "html": f"""
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
                        <h1 style="color: #CBA86E;">Appointment Confirmed!</h1>
                        <p>Hi {user_name or user_email.split('@')[0]},</p>
                        <p>Your appointment has been confirmed.</p>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="color: #CBA86E; margin-top: 0;">Appointment Details</h3>
                            <p><strong>Service:</strong> {appointment_details.get('service_type', 'N/A')}</p>
                            <p><strong>Date & Time:</strong> {appointment_details.get('scheduled_at', 'N/A')}</p>
                            <p><strong>Location:</strong> {appointment_details.get('location', 'N/A')}</p>
                        </div>
                        
                        <p>Please arrive 10 minutes early to check in.</p>
                        
                        <p style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px;">
                            <strong>Need to reschedule?</strong> Contact us at support@membershipauto.com
                        </p>
                        
                        <p style="color: #777; font-size: 12px; margin-top: 20px;">
                            This is an automated message from Membership Auto. Please do not reply to this email.
                        </p>
                    </div>
                </body>
            </html>
            """
        })
        return True
    except Exception as e:
        print(f"Failed to send appointment confirmation email to {user_email}: {str(e)}")
        return False


def send_billing_reminder_email(user_email, user_name, plan_name, renewal_date):
    """Send billing reminder email before renewal"""
    if not resend_client.api_key:
        print("RESEND_API_KEY not configured. Skipping email send.")
        return False
    
    try:
        resend_client.emails.send({
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": user_email,
            "subject": f"Membership Renewal Reminder - {plan_name} Plan",
            "html": f"""
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
                        <h1 style="color: #CBA86E;">Membership Renewal Reminder</h1>
                        <p>Hi {user_name or user_email.split('@')[0]},</p>
                        <p>Your {plan_name} membership will renew on <strong>{renewal_date}</strong>.</p>
                        
                        <p>Make sure your payment method is up to date to avoid any service interruptions.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="https://membershipauto.com/dashboard/profile" style="background-color: #CBA86E; color: #0d0d0d; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                                Update Payment Method
                            </a>
                        </div>
                        
                        <p style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px;">
                            <strong>Questions?</strong> Contact our support team at support@membershipauto.com
                        </p>
                        
                        <p style="color: #777; font-size: 12px; margin-top: 20px;">
                            This is an automated message from Membership Auto. Please do not reply to this email.
                        </p>
                    </div>
                </body>
            </html>
            """
        })
        return True
    except Exception as e:
        print(f"Failed to send billing reminder email to {user_email}: {str(e)}")
        return False


def send_contact_form_email(name, email, phone, user_type, message):
    """Send contact form submission to support team"""
    if not resend_client.api_key:
        print("RESEND_API_KEY not configured. Skipping email send.")
        return False
    
    try:
        resend_client.emails.send({
            "from": settings.DEFAULT_FROM_EMAIL,
            "to": "nathan@membershipauto.com",
            "subject": f"New Contact Form Submission from {name}",
            "html": f"""
            <html>
                <body style="font-family: Arial, sans-serif; background-color: #f5f5f5; color: #333;">
                    <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px;">
                        <h1 style="color: #CBA86E;">New Contact Form Submission</h1>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="color: #333; margin-top: 0;">Contact Information</h3>
                            <p><strong>Name:</strong> {name}</p>
                            <p><strong>Email:</strong> {email}</p>
                            <p><strong>Phone:</strong> {phone or 'Not provided'}</p>
                            <p><strong>User Type:</strong> {user_type.replace('-', ' ').title()}</p>
                        </div>
                        
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="color: #333; margin-top: 0;">Message</h3>
                            <p style="white-space: pre-wrap; word-wrap: break-word;">{message}</p>
                        </div>
                        
                        <p style="margin-top: 30px; border-top: 1px solid #ccc; padding-top: 20px;">
                            <strong>Reply to:</strong> <a href="mailto:{email}">{email}</a>
                        </p>
                    </div>
                </body>
            </html>
            """
        })
        return True
    except Exception as e:
        print(f"Failed to send contact form email: {str(e)}")
        return False
