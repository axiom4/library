from rest_framework import permissions
from django.conf import settings


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


class AccessListPermission(permissions.BasePermission):
    """
    Allows access only to specific IP addresses.
    """

    def has_permission(self, request, view):
        allowed_ips = getattr(settings, 'ACCESS_LIST', [])
        ip_address = request.META.get('REMOTE_ADDR')
        return ip_address in allowed_ips
