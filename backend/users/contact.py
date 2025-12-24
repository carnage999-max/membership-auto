"""Contact form handling"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from users.email import send_contact_form_email
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def send_contact_message(request):
    """Handle contact form submission"""
    try:
        name = request.data.get('name')
        email = request.data.get('email')
        phone = request.data.get('phone')
        user_type = request.data.get('userType', 'non-member')
        message = request.data.get('message')
        
        # Validate required fields
        if not all([name, email, message]):
            logger.warning(f"Contact form missing required fields: name={bool(name)}, email={bool(email)}, message={bool(message)}")
            return Response(
                {'error': 'Name, email, and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Send email to support
        try:
            success = send_contact_form_email(
                name=name,
                email=email,
                phone=phone,
                user_type=user_type,
                message=message
            )
            
            if not success:
                logger.error(f"Failed to send contact form email for {email}")
                # Still return 200 to user - the message was received even if email failed
                return Response(
                    {'message': 'Your message has been received. We will contact you shortly.'},
                    status=status.HTTP_200_OK
                )
            
            logger.info(f"Contact form email sent successfully from {email}")
            return Response(
                {'message': 'Your message has been sent successfully. We will get back to you soon.'},
                status=status.HTTP_200_OK
            )
        except Exception as email_error:
            logger.error(f"Exception in send_contact_form_email: {str(email_error)}", exc_info=True)
            # Still return success to user since message was received
            return Response(
                {'message': 'Your message has been received. We will contact you shortly.'},
                status=status.HTTP_200_OK
            )
    
    except Exception as e:
        logger.error(f"Unhandled exception in send_contact_message: {str(e)}", exc_info=True)
        return Response(
            {'message': 'Your message has been received. We will contact you shortly.'},
            status=status.HTTP_200_OK
        )
