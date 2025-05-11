# file: library_rest/decorators.py

from functools import wraps
from django.conf import settings
from rest_framework.response import Response
from rest_framework import status


def keycloak_role_required(required_role):
    """
    Decorator to enforce that the requesting user has a specific Keycloak realm role.

    Args:
        required_role (str): The name of the required Keycloak realm role.

    Returns:
        function: A decorator that wraps a Django REST Framework view function.

    Behavior:
        - Checks if the authenticated user possesses the specified Keycloak realm role.
        - If the user has the required role, the view function is executed.
        - If the user does not have the required role, returns a 403 Forbidden response.
        - If there is an error accessing the token or roles, returns a 401 Unauthorized response.

    Usage:
        @keycloak_role_required('admin')
        def my_func(request):
        ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def _wrapped_view(request, *args, **kwargs):

            if settings.DEBUG and request.request.user.is_superuser:
                print("DEBUG: Superuser access granted.")
                return view_func(request, *args, **kwargs)

            try:
                realm_roles = request.request.user.token_info['realm_access'].get('roles', [
                ])

                if required_role in realm_roles:
                    return view_func(request, *args, **kwargs)
                else:
                    return Response({"detail": "You do not have permission to perform this action."}, status=status.HTTP_403_FORBIDDEN)
            except Exception:
                return Response({"detail": "Invalid token."}, status=status.HTTP_401_UNAUTHORIZED)
        return _wrapped_view
    return decorator
