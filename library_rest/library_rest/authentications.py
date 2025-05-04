
from rest_framework import authentication
from rest_framework import exceptions

from keycloak import KeycloakOpenID
import keycloak.exceptions

from django.conf import settings

from datetime import datetime
from django.utils import timezone
import json
from django.contrib.auth.models import AbstractBaseUser


from drf_spectacular.extensions import OpenApiAuthenticationExtension


class KeyCloakAuthenticationSchema(OpenApiAuthenticationExtension):
    # full import path OR class ref
    target_class = 'IpBlocker.authentication.KeyCloakAuthentication'
    name = 'KeyCloakAuthentication'  # name used in the schema

    def get_security_definition(self, auto_schema):
        return {
            'type': 'apiKey',
            'in': 'header',
            'name': 'api_key',
        }


class KeyCloakAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request):
        access_token = request.META.get('HTTP_AUTHORIZATION')

        if not access_token:
            return None

        access_token = access_token.replace("Bearer ", "")

        try:
            keycloak_openid = KeycloakOpenID(
                server_url=settings.KEYCLOAK_CONFIG['KEYCLOAK_SERVER_URL'],
                client_id=settings.KEYCLOAK_CONFIG['KEYCLOAK_CLIENT_ID'],
                realm_name=settings.KEYCLOAK_CONFIG['KEYCLOAK_REALM'],
                client_secret_key=settings.KEYCLOAK_CONFIG['KEYCLOAK_CLIENT_SECRET_KEY']
            )

            user_info = keycloak_openid.userinfo(
                access_token
            )

            token_info = keycloak_openid.introspect(access_token)

        except keycloak.exceptions.KeycloakAuthenticationError:
            raise exceptions.AuthenticationFailed('Invalid token')
        except keycloak.exceptions.KeycloakGetError as e:
            JSON = json.loads(e.response_body.decode('utf8'))
            raise exceptions.AuthenticationFailed(
                'Keycloak error: {}'.format(JSON['error']))
        except keycloak.exceptions.KeycloakConnectionError:
            raise exceptions.AuthenticationFailed(
                'Keycloak connection error')

        # user = User(is_authenticated=True)
        class User(object):
            pass

        user = User()
        user.username = user_info['preferred_username']
        user.email = user_info['email']
        user.first_name = user_info['given_name']
        user.last_name = user_info['family_name']
        user.is_superuser = False
        user.is_staff = False
        user.is_active = True
        user.is_authenticated = True
        user.last_login = timezone.now()
        user.user_info = user_info
        user.token_info = token_info

        return (user, None)
