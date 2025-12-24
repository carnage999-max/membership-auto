"""Contact form handling"""

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from users.email import send_contact_form_email


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
            return Response(
                {'error': 'Name, email, and message are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Send email to support
        success = send_contact_form_email(
            name=name,
            email=email,
            phone=phone,
            user_type=user_type,
            message=message
        )
        
        if not success:
            return Response(
                {'error': 'Failed to send message'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response(
            {'message': 'Contact message sent successfully'},
            status=status.HTTP_200_OK
        )
    
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
