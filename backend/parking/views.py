from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import ParkingSpot
from .serializers import ParkingSpotSerializer


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def parking_spots(request):
    """
    GET: List all parking spots for user (or just active one)
    POST: Create a new parking spot
    """
    if request.method == "GET":
        active_only = request.query_params.get("active", "false").lower() == "true"

        if active_only:
            spots = ParkingSpot.objects.filter(user=request.user, active=True)
        else:
            spots = ParkingSpot.objects.filter(user=request.user)

        serializer = ParkingSpotSerializer(spots, many=True)
        return Response(serializer.data)

    elif request.method == "POST":
        serializer = ParkingSpotSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def parking_spot_detail(request, pk):
    """
    GET: Get a specific parking spot
    PATCH: Update a parking spot (e.g., extend timer, add notes)
    DELETE: Delete a parking spot
    """
    try:
        spot = ParkingSpot.objects.get(pk=pk, user=request.user)
    except ParkingSpot.DoesNotExist:
        return Response(
            {"error": "Parking spot not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if request.method == "GET":
        serializer = ParkingSpotSerializer(spot)
        return Response(serializer.data)

    elif request.method == "PATCH":
        serializer = ParkingSpotSerializer(spot, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    elif request.method == "DELETE":
        spot.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def clear_active_spot(request):
    """Clear/deactivate the current active parking spot"""
    ParkingSpot.objects.filter(user=request.user, active=True).update(active=False)
    return Response(
        {"message": "Active parking spot cleared"}, status=status.HTTP_200_OK
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def active_spot(request):
    """Get the currently active parking spot"""
    try:
        spot = ParkingSpot.objects.get(user=request.user, active=True)
        serializer = ParkingSpotSerializer(spot)
        return Response(serializer.data)
    except ParkingSpot.DoesNotExist:
        return Response(
            {"error": "No active parking spot"}, status=status.HTTP_404_NOT_FOUND
        )
