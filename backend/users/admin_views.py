"""
Admin API Views for Membership Auto Admin Dashboard
Handles all admin-only endpoints for managing the platform
"""

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.contrib.auth import authenticate
from django.db.models import Count, Sum, Avg, Q
from django.db.models.functions import TruncMonth
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser, AllowAny
from rest_framework.authtoken.models import Token
from datetime import datetime, timedelta
from decimal import Decimal
import json

from .models import User
from vehicles.models import Vehicle
from appointments.models import Appointment, Location
from offers.models import Offer
from referrals.models import Referral
from chat.models import ChatMessage


# ============================================================================
# AUTHENTICATION
# ============================================================================


@api_view(["POST"])
@permission_classes([AllowAny])
def admin_login(request):
    """
    Admin login endpoint - requires staff status
    """
    try:
        data = request.data if hasattr(request, "data") else json.loads(request.body)
        email = data.get("email")
        password = data.get("password")

        if not email or not password:
            return JsonResponse(
                {"error": "Email and password are required"}, status=400
            )

        # Authenticate user
        user = authenticate(request, username=email, password=password)

        if user is None:
            # Try to get user directly to check if they exist
            try:
                user_obj = User.objects.get(email=email)
                if not user_obj.check_password(password):
                    return JsonResponse({"error": "Invalid credentials"}, status=401)
                user = user_obj
            except User.DoesNotExist:
                return JsonResponse({"error": "Invalid credentials"}, status=401)

        # Check staff status
        if not user.is_staff:
            return JsonResponse(
                {"error": "Insufficient permissions - admin access required"},
                status=403,
            )

        # Create or get token
        token, _ = Token.objects.get_or_create(user=user)

        return JsonResponse(
            {
                "token": token.key,
                "user": {
                    "id": str(user.id),
                    "name": user.name or user.email,
                    "email": user.email,
                    "is_superuser": user.is_superuser,
                },
            }
        )
    except Exception as e:
        return JsonResponse({"error": f"Login failed: {str(e)}"}, status=500)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def verify_admin_token(request):
    """
    Verify admin token is still valid
    """
    return JsonResponse(
        {
            "valid": True,
            "user": {
                "id": request.user.id,
                "name": f"{request.user.first_name} {request.user.last_name}".strip()
                or request.user.email,
                "email": request.user.email,
            },
        }
    )


# ============================================================================
# ANALYTICS DASHBOARD
# ============================================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def dashboard_analytics(request):
    """
    Get comprehensive dashboard analytics
    """
    # Date ranges
    today = datetime.now().date()
    month_start = today.replace(day=1)
    last_month_start = (month_start - timedelta(days=1)).replace(day=1)

    # Total counts
    total_members = User.objects.filter(is_active=True, is_staff=False).count()
    last_month_members = User.objects.filter(
        is_active=True, is_staff=False, created_at__lt=month_start
    ).count()

    total_vehicles = Vehicle.objects.count()
    # Vehicle model doesn't have created_at field
    last_month_vehicles = total_vehicles  # Placeholder

    # Revenue (simplified - you'll need to adjust based on your billing model)
    # This assumes you have a Subscription or Payment model
    monthly_revenue = total_members * 79  # Average plan price
    last_month_revenue = last_month_members * 79

    # Appointments - using start_time field
    today_start = timezone.make_aware(datetime.combine(today, datetime.min.time()))
    today_end = timezone.make_aware(datetime.combine(today, datetime.max.time()))
    appointments_today = Appointment.objects.filter(
        start_time__range=(today_start, today_end)
    ).count()

    yesterday = today - timedelta(days=1)
    yesterday_start = timezone.make_aware(
        datetime.combine(yesterday, datetime.min.time())
    )
    yesterday_end = timezone.make_aware(
        datetime.combine(yesterday, datetime.max.time())
    )
    appointments_yesterday = Appointment.objects.filter(
        start_time__range=(yesterday_start, yesterday_end)
    ).count()

    # Calculate percentage changes
    members_change = (
        ((total_members - last_month_members) / last_month_members * 100)
        if last_month_members > 0
        else 0
    )
    vehicles_change = (
        ((total_vehicles - last_month_vehicles) / last_month_vehicles * 100)
        if last_month_vehicles > 0
        else 0
    )
    revenue_change = (
        ((monthly_revenue - last_month_revenue) / last_month_revenue * 100)
        if last_month_revenue > 0
        else 0
    )
    appointments_change = (
        ((appointments_today - appointments_yesterday) / appointments_yesterday * 100)
        if appointments_yesterday > 0
        else 0
    )

    # Revenue chart data (last 6 months)
    revenue_chart = []
    for i in range(6, 0, -1):
        month_date = today - timedelta(days=30 * i)
        month_name = month_date.strftime("%b")
        # Simplified - you'll need actual revenue tracking
        revenue_chart.append(
            {
                "month": month_name,
                "revenue": (total_members - (i * 10)) * 79,  # Simulated growth
            }
        )

    # Membership tiers distribution
    membership_tiers = [
        {"name": "Basic", "value": int(total_members * 0.40)},
        {"name": "Plus", "value": int(total_members * 0.35)},
        {"name": "Premium", "value": int(total_members * 0.20)},
        {"name": "Elite", "value": int(total_members * 0.05)},
    ]

    # Appointments by day (this week)
    appointments_chart = []
    for i in range(7):
        day_date = today - timedelta(days=6 - i)
        day_name = day_date.strftime("%a")
        day_appointments = Appointment.objects.filter(scheduled_date=day_date)

        appointments_chart.append(
            {
                "day": day_name,
                "scheduled": day_appointments.filter(status="scheduled").count(),
                "completed": day_appointments.filter(status="completed").count(),
                "cancelled": day_appointments.filter(status="cancelled").count(),
            }
        )

    return JsonResponse(
        {
            "total_members": total_members,
            "members_change": round(members_change, 1),
            "total_vehicles": total_vehicles,
            "vehicles_change": round(vehicles_change, 1),
            "monthly_revenue": monthly_revenue,
            "revenue_change": round(revenue_change, 1),
            "appointments_today": appointments_today,
            "appointments_change": round(appointments_change, 1),
            "revenue_chart": revenue_chart,
            "membership_tiers": membership_tiers,
            "appointments_chart": appointments_chart,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def revenue_analytics(request):
    """
    Detailed revenue analytics
    """
    # This is simplified - implement based on your actual billing system
    return JsonResponse(
        {
            "total_revenue": 0,
            "monthly_recurring": 0,
            "average_per_member": 0,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def member_analytics(request):
    """
    Member growth and engagement analytics
    """
    total_members = User.objects.filter(is_active=True, is_staff=False).count()

    return JsonResponse(
        {
            "total": total_members,
            "active_30_days": total_members,  # Implement activity tracking
            "churn_rate": 2.5,  # Implement churn calculation
        }
    )


# ============================================================================
# MEMBER MANAGEMENT
# ============================================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def list_members(request):
    """
    List all members with filtering and pagination
    """
    search = request.GET.get("search", "")
    page = int(request.GET.get("page", 1))
    per_page = int(request.GET.get("per_page", 20))

    members = User.objects.filter(is_staff=False)

    if search:
        members = members.filter(
            Q(email__icontains=search)
            | Q(name__icontains=search)
            | Q(membership_id__icontains=search)
        )

    total = members.count()
    start = (page - 1) * per_page
    end = start + per_page

    members_data = []
    for member in members[start:end]:
        vehicles = Vehicle.objects.filter(user=member)
        members_data.append(
            {
                "id": str(member.id),
                "name": member.name or "No name",
                "email": member.email,
                "phone": member.phone or "",
                "membership_id": member.membership_id or "",
                "role": member.role,
                "rewards_balance": member.rewards_balance,
                "created_at": member.created_at.isoformat(),
                "is_active": member.is_active,
                "vehicle_count": vehicles.count(),
            }
        )

    return JsonResponse(
        {
            "results": members_data,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def member_detail(request, member_id):
    """
    Get detailed member information
    """
    try:
        member = User.objects.get(id=member_id, is_staff=False)
        vehicles = Vehicle.objects.filter(user=member)
        appointments = Appointment.objects.filter(user=member).order_by("-start_time")[
            :10
        ]

        return JsonResponse(
            {
                "id": str(member.id),
                "name": member.name or "No name",
                "email": member.email,
                "phone": member.phone or "",
                "membership_id": member.membership_id or "",
                "role": member.role,
                "rewards_balance": member.rewards_balance,
                "created_at": member.created_at.isoformat(),
                "is_active": member.is_active,
                "vehicles": [
                    {
                        "id": str(v.id),
                        "year": v.year,
                        "make": v.make,
                        "model": v.model,
                        "vin": v.vin,
                        "photo_url": v.photo_url,
                    }
                    for v in vehicles
                ],
                "recent_appointments": [
                    {
                        "id": str(a.id),
                        "date": a.start_time.isoformat(),
                        "service": ", ".join(a.services) if a.services else "Service",
                        "status": a.status,
                    }
                    for a in appointments
                ],
            }
        )
    except User.DoesNotExist:
        return JsonResponse({"error": "Member not found"}, status=404)


@api_view(["PUT"])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_subscription(request, member_id):
    """
    Update member subscription plan
    """
    try:
        member = User.objects.get(id=member_id, is_staff=False)
        data = json.loads(request.body)

        # Implement subscription update logic

        return JsonResponse({"success": True})
    except User.DoesNotExist:
        return JsonResponse({"error": "Member not found"}, status=404)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def member_service_history(request, member_id):
    """
    Get complete service history for a member
    """
    try:
        member = User.objects.get(id=member_id, is_staff=False)
        appointments = Appointment.objects.filter(vehicle__user=member).order_by(
            "-created_at"
        )

        history = [
            {
                "id": apt.id,
                "date": apt.created_at.isoformat(),
                "vehicle": f"{apt.vehicle.year} {apt.vehicle.make} {apt.vehicle.model}",
                "service": getattr(apt, "service_type", "Service"),
                "status": getattr(apt, "status", "pending"),
            }
            for apt in appointments
        ]

        return JsonResponse({"history": history})
    except User.DoesNotExist:
        return JsonResponse({"error": "Member not found"}, status=404)


# ============================================================================
# VEHICLE MANAGEMENT
# ============================================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def list_vehicles(request):
    """
    List all vehicles with filtering
    """
    search = request.GET.get("search", "")
    page = int(request.GET.get("page", 1))
    per_page = int(request.GET.get("per_page", 20))

    vehicles = Vehicle.objects.select_related("user").all()

    if search:
        vehicles = vehicles.filter(
            Q(vin__icontains=search)
            | Q(make__icontains=search)
            | Q(model__icontains=search)
            | Q(license_plate__icontains=search)
            | Q(user__email__icontains=search)
            | Q(user__name__icontains=search)
        )

    total = vehicles.count()
    start = (page - 1) * per_page
    end = start + per_page

    vehicles_data = [
        {
            "id": str(v.id),
            "year": v.year,
            "make": v.make,
            "model": v.model,
            "color": v.color if hasattr(v, "color") else None,
            "vin": v.vin,
            "license_plate": v.license_plate,
            "photo_url": v.photo_url if hasattr(v, "photo_url") else None,
            "owner": {
                "id": str(v.user.id),
                "name": v.user.name or "No name",
                "email": v.user.email,
            },
            "health_status": "good",  # TODO: Implement from vehicle_health
            "last_service": None,  # TODO: Implement from appointments
            "created_at": (
                v.created_at.isoformat()
                if hasattr(v, "created_at")
                else timezone.now().isoformat()
            ),
        }
        for v in vehicles[start:end]
    ]

    return JsonResponse(
        {
            "results": vehicles_data,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
        }
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def vehicle_detail(request, vehicle_id):
    """
    Get detailed vehicle information
    """
    try:
        vehicle = Vehicle.objects.select_related("user").get(id=vehicle_id)

        return JsonResponse(
            {
                "id": vehicle.id,
                "year": vehicle.year,
                "make": vehicle.make,
                "model": vehicle.model,
                "vin": vehicle.vin,
                "photo_url": (
                    vehicle.photo_url if hasattr(vehicle, "photo_url") else None
                ),
                "owner": {
                    "id": vehicle.user.id,
                    "name": f"{vehicle.user.first_name} {vehicle.user.last_name}".strip(),
                    "email": vehicle.user.email,
                },
            }
        )
    except Vehicle.DoesNotExist:
        return JsonResponse({"error": "Vehicle not found"}, status=404)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def vehicle_health(request, vehicle_id):
    """
    Get vehicle health and diagnostics data
    """
    try:
        vehicle = Vehicle.objects.get(id=vehicle_id)
        # Implement health data retrieval

        return JsonResponse(
            {
                "vehicle_id": vehicle_id,
                "health_score": 85,
                "issues": [],
            }
        )
    except Vehicle.DoesNotExist:
        return JsonResponse({"error": "Vehicle not found"}, status=404)


# ============================================================================
# APPOINTMENT MANAGEMENT
# ============================================================================


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def list_appointments(request):
    """
    List all appointments with filtering or create a new appointment
    """
    if request.method == "POST":
        # Create new appointment
        try:
            data = json.loads(request.body)

            # Get related objects
            from users.models import User

            user = User.objects.get(id=data.get("user_id"))
            vehicle = Vehicle.objects.get(id=data.get("vehicle_id"))
            location = Location.objects.get(id=data.get("location_id"))

            # Parse datetime
            start_time = datetime.fromisoformat(
                data.get("start_time").replace("Z", "+00:00")
            )

            # Get service schedule if provided
            service_schedule = None
            if data.get("service_schedule_id"):
                from services.models import ServiceSchedule

                try:
                    service_schedule = ServiceSchedule.objects.get(
                        id=data.get("service_schedule_id"), vehicle=vehicle
                    )
                except ServiceSchedule.DoesNotExist:
                    pass

            # Create appointment
            appointment = Appointment.objects.create(
                user=user,
                vehicle=vehicle,
                location=location,
                service_schedule=service_schedule,
                start_time=start_time,
                services=(
                    data.get("services", [])
                    if isinstance(data.get("services"), list)
                    else [data.get("services", "Service")]
                ),
                status=data.get("status", "scheduled"),
                notes=data.get("notes", ""),
            )

            return JsonResponse(
                {
                    "id": str(appointment.id),
                    "member": {
                        "id": str(user.id),
                        "name": user.name or "No name",
                        "email": user.email,
                    },
                    "vehicle": {
                        "id": str(vehicle.id),
                        "year": vehicle.year,
                        "make": vehicle.make,
                        "model": vehicle.model,
                    },
                    "service_type": (
                        ", ".join(appointment.services)
                        if appointment.services
                        else "Service"
                    ),
                    "status": appointment.status,
                    "scheduled_time": appointment.start_time.isoformat(),
                    "location": location.name,
                },
                status=201,
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    # GET request - list appointments
    status = request.GET.get("status", "")
    date = request.GET.get("date", "")
    page = int(request.GET.get("page", 1))
    per_page = int(request.GET.get("per_page", 20))

    appointments = Appointment.objects.select_related(
        "user", "vehicle", "location"
    ).all()

    if status:
        appointments = appointments.filter(status=status)

    if date:
        try:
            filter_date = datetime.strptime(date, "%Y-%m-%d").date()
            appointments = appointments.filter(start_time__date=filter_date)
        except ValueError:
            pass

    total = appointments.count()
    start = (page - 1) * per_page
    end = start + per_page

    appointments_data = [
        {
            "id": str(apt.id),
            "member": {
                "id": str(apt.user.id),
                "name": apt.user.name or "No name",
                "email": apt.user.email,
            },
            "vehicle": (
                {
                    "id": str(apt.vehicle.id) if apt.vehicle else None,
                    "year": apt.vehicle.year if apt.vehicle else None,
                    "make": apt.vehicle.make if apt.vehicle else None,
                    "model": apt.vehicle.model if apt.vehicle else None,
                }
                if apt.vehicle
                else None
            ),
            "service_type": ", ".join(apt.services) if apt.services else "Service",
            "status": apt.status,
            "scheduled_time": apt.start_time.isoformat(),
            "location": apt.location.name if apt.location else "N/A",
            "notes": apt.notes or "",
        }
        for apt in appointments[start:end]
    ]

    return JsonResponse(
        {
            "results": appointments_data,
            "total": total,
            "page": page,
            "per_page": per_page,
            "pages": (total + per_page - 1) // per_page,
        }
    )


@api_view(["GET", "PATCH", "PUT"])
@permission_classes([IsAuthenticated, IsAdminUser])
def appointment_detail(request, appointment_id):
    """
    Get or update detailed appointment information
    """
    try:
        appointment = Appointment.objects.select_related(
            "vehicle", "vehicle__user"
        ).get(id=appointment_id)

        if request.method in ["PATCH", "PUT"]:
            # Update appointment
            data = json.loads(request.body)

            old_status = appointment.status
            new_status = data.get("status")

            if "status" in data and hasattr(appointment, "status"):
                appointment.status = new_status

            if "notes" in data and hasattr(appointment, "notes"):
                appointment.notes = data.get("notes")

            appointment.save()

            # If appointment is marked as completed and linked to service schedule, update it
            if (
                new_status == "completed"
                and old_status != "completed"
                and appointment.service_schedule
            ):
                from services.models import ServiceSchedule
                from datetime import date

                schedule = appointment.service_schedule
                schedule.last_completed_date = date.today()

                # Update last completed mileage if vehicle has odometer data
                if appointment.vehicle and appointment.vehicle.odometer:
                    schedule.last_completed_mileage = appointment.vehicle.odometer

                    # Calculate next due mileage
                    if schedule.mileage_trigger:
                        schedule.next_due_mileage = (
                            appointment.vehicle.odometer + schedule.mileage_trigger
                        )

                # Calculate next due date
                if schedule.time_trigger_months:
                    from dateutil.relativedelta import relativedelta

                    schedule.next_due_date = date.today() + relativedelta(
                        months=schedule.time_trigger_months
                    )

                # Update status to upcoming
                schedule.status = "upcoming"
                schedule.save()

            return JsonResponse({"success": True, "status": appointment.status})

        # GET request
        return JsonResponse(
            {
                "id": appointment.id,
                "scheduled_date": (
                    appointment.scheduled_date.isoformat()
                    if hasattr(appointment, "scheduled_date")
                    else None
                ),
                "scheduled_time": getattr(appointment, "scheduled_time", None),
                "member": {
                    "id": appointment.vehicle.user.id,
                    "name": f"{appointment.vehicle.user.first_name} {appointment.vehicle.user.last_name}".strip(),
                    "email": appointment.vehicle.user.email,
                },
                "vehicle": {
                    "id": appointment.vehicle.id,
                    "description": f"{appointment.vehicle.year} {appointment.vehicle.make} {appointment.vehicle.model}",
                },
                "service": getattr(appointment, "service_type", "Service"),
                "status": getattr(appointment, "status", "pending"),
                "notes": getattr(appointment, "notes", ""),
            }
        )
    except Appointment.DoesNotExist:
        return JsonResponse({"error": "Appointment not found"}, status=404)


@api_view(["PUT"])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_appointment_status(request, appointment_id):
    """
    Update appointment status
    """
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        data = json.loads(request.body)

        if hasattr(appointment, "status"):
            appointment.status = data.get("status")
            appointment.save()

        return JsonResponse({"success": True})
    except Appointment.DoesNotExist:
        return JsonResponse({"error": "Appointment not found"}, status=404)


@api_view(["PUT"])
@permission_classes([IsAuthenticated, IsAdminUser])
def assign_appointment(request, appointment_id):
    """
    Assign appointment to a technician
    """
    try:
        appointment = Appointment.objects.get(id=appointment_id)
        data = json.loads(request.body)

        # Implement technician assignment logic

        return JsonResponse({"success": True})
    except Appointment.DoesNotExist:
        return JsonResponse({"error": "Appointment not found"}, status=404)


# ============================================================================
# OFFERS MANAGEMENT
# ============================================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def list_offers(request):
    """
    List all offers
    """
    offers = Offer.objects.all().order_by("-created_at")

    offers_data = [
        {
            "id": offer.id,
            "title": offer.title,
            "description": offer.description,
            "discount_percent": getattr(offer, "discount_percent", 0),
            "valid_from": (
                offer.valid_from.isoformat() if hasattr(offer, "valid_from") else None
            ),
            "valid_until": (
                offer.valid_until.isoformat() if hasattr(offer, "valid_until") else None
            ),
            "is_active": offer.is_active if hasattr(offer, "is_active") else True,
        }
        for offer in offers
    ]

    return JsonResponse({"offers": offers_data})


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_offer(request):
    """
    Create a new offer
    """
    data = json.loads(request.body)

    offer = Offer.objects.create(
        title=data.get("title"),
        description=data.get("description"),
    )

    return JsonResponse({"id": offer.id, "success": True})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def offer_detail(request, offer_id):
    """
    Get offer details
    """
    try:
        offer = Offer.objects.get(id=offer_id)

        return JsonResponse(
            {
                "id": offer.id,
                "title": offer.title,
                "description": offer.description,
                "discount_percent": getattr(offer, "discount_percent", 0),
                "valid_from": (
                    offer.valid_from.isoformat()
                    if hasattr(offer, "valid_from")
                    else None
                ),
                "valid_until": (
                    offer.valid_until.isoformat()
                    if hasattr(offer, "valid_until")
                    else None
                ),
                "is_active": offer.is_active if hasattr(offer, "is_active") else True,
            }
        )
    except Offer.DoesNotExist:
        return JsonResponse({"error": "Offer not found"}, status=404)


@api_view(["PUT"])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_offer(request, offer_id):
    """
    Update an offer
    """
    try:
        offer = Offer.objects.get(id=offer_id)
        data = json.loads(request.body)

        offer.title = data.get("title", offer.title)
        offer.description = data.get("description", offer.description)
        offer.save()

        return JsonResponse({"success": True})
    except Offer.DoesNotExist:
        return JsonResponse({"error": "Offer not found"}, status=404)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsAdminUser])
def delete_offer(request, offer_id):
    """
    Delete an offer
    """
    try:
        offer = Offer.objects.get(id=offer_id)
        offer.delete()

        return JsonResponse({"success": True})
    except Offer.DoesNotExist:
        return JsonResponse({"error": "Offer not found"}, status=404)


# ============================================================================
# CHAT MANAGEMENT
# ============================================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def list_chat_threads(request):
    """
    List all chat threads for admin view
    """
    from chat.models import ChatThread
    from chat.serializers import ChatThreadSerializer

    threads = (
        ChatThread.objects.all().prefetch_related("messages").order_by("-created_at")
    )
    serializer = ChatThreadSerializer(threads, many=True)
    return JsonResponse({"threads": serializer.data})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def chat_thread_detail(request, thread_id):
    """
    Get chat thread with all messages
    """
    from chat.models import ChatThread, ChatMessage
    from chat.serializers import ChatMessageSerializer

    try:
        thread = ChatThread.objects.get(id=thread_id)
        messages = ChatMessage.objects.filter(thread=thread).order_by("created_at")
        serializer = ChatMessageSerializer(messages, many=True)
        return JsonResponse(
            {
                "thread": {
                    "id": str(thread.id),
                    "user": str(thread.user.email),
                    "subject": thread.subject,
                    "status": thread.status,
                    "created_at": thread.created_at.isoformat(),
                },
                "messages": serializer.data,
            }
        )
    except ChatThread.DoesNotExist:
        return JsonResponse({"error": "Thread not found"}, status=404)


@api_view(["PUT", "POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def assign_chat_thread(request, thread_id):
    """
    Assign chat thread to staff member and optionally send a response
    """
    from chat.models import ChatThread, ChatMessage

    try:
        thread = ChatThread.objects.get(id=thread_id)

        # Optionally send a message from support
        message_body = request.data.get("message")
        if message_body:
            ChatMessage.objects.create(
                thread=thread,
                sender="support",
                body=message_body,
            )

        # Update thread status
        thread.status = request.data.get("status", thread.status)
        thread.save()

        return JsonResponse(
            {"success": True, "thread_id": str(thread.id), "status": thread.status}
        )
    except ChatThread.DoesNotExist:
        return JsonResponse({"error": "Thread not found"}, status=404)


# ============================================================================
# REFERRAL MANAGEMENT
# ============================================================================


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def list_referrals(request):
    """
    List all referrals
    """
    referrals = Referral.objects.select_related("referrer", "referred").all()

    referrals_data = [
        {
            "id": ref.id,
            "referrer": ref.referrer.email if ref.referrer else None,
            "referred": ref.referred.email if ref.referred else None,
            "status": ref.status if hasattr(ref, "status") else "pending",
            "created_at": (
                ref.created_at.isoformat() if hasattr(ref, "created_at") else None
            ),
        }
        for ref in referrals
    ]

    return JsonResponse({"referrals": referrals_data})


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def referral_stats(request):
    """
    Get referral program statistics
    """
    total_referrals = Referral.objects.count()

    return JsonResponse(
        {
            "total": total_referrals,
            "successful": 0,  # Implement success tracking
            "conversion_rate": 0,
        }
    )


# ============================================================================
# LOCATION MANAGEMENT
# ============================================================================


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def list_locations(request):
    """
    List all service locations or create a new one
    """
    if request.method == "POST":
        # Create a new location
        try:
            data = json.loads(request.body)

            # Combine address fields for the address field
            full_address = f"{data.get('address', '')}, {data.get('city', '')}, {data.get('state', '')} {data.get('zip_code', '')}".strip()

            # Create the location in the database
            location = Location.objects.create(
                name=data.get("name"),
                address=full_address,
                phone=data.get("phone"),
                hours=data.get("hours", {}),
            )

            return JsonResponse(
                {
                    "id": str(location.id),
                    "name": location.name,
                    "address": location.address,
                    "phone": location.phone,
                    "hours": location.hours,
                    "created_at": location.created_at.isoformat(),
                    "status": "active",
                },
                status=201,
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    # GET request - retrieve all locations from database
    locations = Location.objects.all().order_by("-created_at")
    locations_data = [
        {
            "id": str(loc.id),
            "name": loc.name,
            "address": loc.address,
            "phone": loc.phone,
            "hours": loc.hours,
            "created_at": loc.created_at.isoformat(),
            "status": "active",
        }
        for loc in locations
    ]

    return JsonResponse({"locations": locations_data})


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated, IsAdminUser])
def location_detail(request, location_id):
    """
    Get, update, or delete a location
    """
    try:
        location = Location.objects.get(id=location_id)
    except Location.DoesNotExist:
        return JsonResponse({"error": "Location not found"}, status=404)

    if request.method == "GET":
        return JsonResponse(
            {
                "id": str(location.id),
                "name": location.name,
                "address": location.address,
                "phone": location.phone,
                "hours": location.hours,
                "created_at": location.created_at.isoformat(),
                "status": "active",
            }
        )

    elif request.method == "PUT":
        try:
            data = json.loads(request.body)

            # Combine address fields if provided
            if "city" in data or "state" in data or "zip_code" in data:
                full_address = f"{data.get('address', '')}, {data.get('city', '')}, {data.get('state', '')} {data.get('zip_code', '')}".strip()
                location.address = full_address
            elif "address" in data:
                location.address = data.get("address")

            # Update other fields
            if "name" in data:
                location.name = data.get("name")
            if "phone" in data:
                location.phone = data.get("phone")
            if "hours" in data:
                location.hours = data.get("hours")

            location.save()

            return JsonResponse(
                {
                    "id": str(location.id),
                    "name": location.name,
                    "address": location.address,
                    "phone": location.phone,
                    "hours": location.hours,
                    "created_at": location.created_at.isoformat(),
                    "status": "active",
                }
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    elif request.method == "DELETE":
        location.delete()
        return JsonResponse({"success": True}, status=204)


# ============================================================================
# SERVICE SCHEDULE MANAGEMENT
# ============================================================================


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def list_service_schedules(request):
    """
    List all service schedules with filtering or create a new one
    """
    if request.method == "POST":
        # Create a new service schedule
        try:
            data = json.loads(request.body)
            from services.models import ServiceSchedule, ServiceType
            from vehicles.models import Vehicle
            from datetime import date
            from dateutil.relativedelta import relativedelta

            # Get related objects
            vehicle = Vehicle.objects.get(id=data.get("vehicle_id"))
            service_type = ServiceType.objects.get(id=data.get("service_type_id"))

            # Calculate next due dates
            current_mileage = vehicle.odometer or 0
            mileage_trigger = data.get("mileage_trigger")
            time_trigger_months = data.get("time_trigger_months")

            next_due_mileage = None
            if mileage_trigger:
                next_due_mileage = current_mileage + mileage_trigger

            next_due_date = None
            if time_trigger_months:
                next_due_date = date.today() + relativedelta(months=time_trigger_months)

            # Create schedule
            schedule = ServiceSchedule.objects.create(
                vehicle=vehicle,
                service_type=service_type,
                mileage_trigger=mileage_trigger,
                time_trigger_months=time_trigger_months,
                next_due_mileage=next_due_mileage,
                next_due_date=next_due_date,
                status=data.get("status", "upcoming"),
                notes=data.get("notes", ""),
            )

            return JsonResponse(
                {
                    "id": str(schedule.id),
                    "vehicle": {
                        "id": str(vehicle.id),
                        "year": vehicle.year,
                        "make": vehicle.make,
                        "model": vehicle.model,
                    },
                    "service_type": {
                        "id": str(service_type.id),
                        "name": service_type.name,
                        "description": service_type.description,
                    },
                    "mileage_trigger": schedule.mileage_trigger,
                    "time_trigger_months": schedule.time_trigger_months,
                    "next_due_mileage": schedule.next_due_mileage,
                    "next_due_date": (
                        schedule.next_due_date.isoformat()
                        if schedule.next_due_date
                        else None
                    ),
                    "status": schedule.status,
                    "created_at": schedule.created_at.isoformat(),
                },
                status=201,
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    # GET - List schedules
    from services.models import ServiceSchedule

    # Filter options
    vehicle_id = request.GET.get("vehicle_id")
    status_filter = request.GET.get("status")
    user_id = request.GET.get("user_id")

    schedules = ServiceSchedule.objects.select_related(
        "vehicle", "service_type", "vehicle__user"
    ).all()

    if vehicle_id:
        schedules = schedules.filter(vehicle_id=vehicle_id)
    if status_filter:
        schedules = schedules.filter(status=status_filter)
    if user_id:
        schedules = schedules.filter(vehicle__user_id=user_id)

    schedules_list = []
    for schedule in schedules:
        schedules_list.append(
            {
                "id": str(schedule.id),
                "vehicle": {
                    "id": str(schedule.vehicle.id),
                    "year": schedule.vehicle.year,
                    "make": schedule.vehicle.make,
                    "model": schedule.vehicle.model,
                    "owner": {
                        "id": str(schedule.vehicle.user.id),
                        "name": schedule.vehicle.user.name or "No name",
                        "email": schedule.vehicle.user.email,
                    },
                },
                "service_type": {
                    "id": str(schedule.service_type.id),
                    "name": schedule.service_type.name,
                    "description": schedule.service_type.description,
                    "priority": schedule.service_type.priority,
                },
                "mileage_trigger": schedule.mileage_trigger,
                "time_trigger_months": schedule.time_trigger_months,
                "last_completed_date": (
                    schedule.last_completed_date.isoformat()
                    if schedule.last_completed_date
                    else None
                ),
                "last_completed_mileage": schedule.last_completed_mileage,
                "next_due_mileage": schedule.next_due_mileage,
                "next_due_date": (
                    schedule.next_due_date.isoformat()
                    if schedule.next_due_date
                    else None
                ),
                "status": schedule.status,
                "notes": schedule.notes,
                "created_at": schedule.created_at.isoformat(),
            }
        )

    return JsonResponse({"schedules": schedules_list, "count": len(schedules_list)})


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated, IsAdminUser])
def service_schedule_detail(request, schedule_id):
    """
    Get, update, or delete a specific service schedule
    """
    from services.models import ServiceSchedule

    try:
        schedule = ServiceSchedule.objects.select_related(
            "vehicle", "service_type", "vehicle__user"
        ).get(id=schedule_id)
    except ServiceSchedule.DoesNotExist:
        return JsonResponse({"error": "Service schedule not found"}, status=404)

    if request.method == "GET":
        return JsonResponse(
            {
                "id": str(schedule.id),
                "vehicle": {
                    "id": str(schedule.vehicle.id),
                    "year": schedule.vehicle.year,
                    "make": schedule.vehicle.make,
                    "model": schedule.vehicle.model,
                    "odometer": schedule.vehicle.odometer,
                    "owner": {
                        "id": str(schedule.vehicle.user.id),
                        "name": schedule.vehicle.user.name or "No name",
                        "email": schedule.vehicle.user.email,
                    },
                },
                "service_type": {
                    "id": str(schedule.service_type.id),
                    "name": schedule.service_type.name,
                    "description": schedule.service_type.description,
                    "estimated_duration": schedule.service_type.estimated_duration,
                    "jobs": schedule.service_type.jobs,
                    "priority": schedule.service_type.priority,
                },
                "mileage_trigger": schedule.mileage_trigger,
                "time_trigger_months": schedule.time_trigger_months,
                "last_completed_date": (
                    schedule.last_completed_date.isoformat()
                    if schedule.last_completed_date
                    else None
                ),
                "last_completed_mileage": schedule.last_completed_mileage,
                "next_due_mileage": schedule.next_due_mileage,
                "next_due_date": (
                    schedule.next_due_date.isoformat()
                    if schedule.next_due_date
                    else None
                ),
                "status": schedule.status,
                "notes": schedule.notes,
                "created_at": schedule.created_at.isoformat(),
                "updated_at": schedule.updated_at.isoformat(),
            }
        )

    elif request.method == "PUT":
        # Update schedule
        try:
            data = json.loads(request.body)
            from datetime import date
            from dateutil.relativedelta import relativedelta

            # Update fields
            if "mileage_trigger" in data:
                schedule.mileage_trigger = data["mileage_trigger"]
            if "time_trigger_months" in data:
                schedule.time_trigger_months = data["time_trigger_months"]
            if "next_due_mileage" in data:
                schedule.next_due_mileage = data["next_due_mileage"]
            if "next_due_date" in data:
                schedule.next_due_date = data["next_due_date"]
            if "status" in data:
                schedule.status = data["status"]
            if "notes" in data:
                schedule.notes = data["notes"]
            if "last_completed_date" in data:
                schedule.last_completed_date = data["last_completed_date"]
            if "last_completed_mileage" in data:
                schedule.last_completed_mileage = data["last_completed_mileage"]

            schedule.save()

            return JsonResponse(
                {
                    "id": str(schedule.id),
                    "status": schedule.status,
                    "next_due_mileage": schedule.next_due_mileage,
                    "next_due_date": (
                        schedule.next_due_date.isoformat()
                        if schedule.next_due_date
                        else None
                    ),
                    "updated_at": schedule.updated_at.isoformat(),
                }
            )
        except Exception as e:
            return JsonResponse({"error": str(e)}, status=400)

    elif request.method == "DELETE":
        schedule.delete()
        return JsonResponse({"success": True}, status=204)
