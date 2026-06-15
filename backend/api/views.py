from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def test_connection(request):
    return Response({
        "status": "success",
        "message": "Django and React are officially connected!"
    })