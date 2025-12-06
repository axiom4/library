# A Full Test Application Using Django and Angular (Part 16) - Keycloak Advanced

This chapter delves into some advanced Keycloak features that are fundamental for managing security and integrating applications. In particular, the following topics will be covered:

- **Application-level roles**: we will see how to define and manage roles specific to applications, assigning granular permissions to users and groups.
- **Exposing custom attributes**: we will illustrate how to add and make custom attributes available within tokens, useful for enriching user information and supporting advanced application logic.
- **Strong authentication methods**: we will analyze the options offered by Keycloak to implement multi-factor authentication (MFA) and strengthen access security.
- **Integration with external SSO systems**: we will explain how to configure Keycloak to federate identities and enable access through external providers, facilitating integration with existing infrastructures.
  These topics will allow you to fully leverage Keycloak’s capabilities in enterprise scenarios and ensure a high level of security and flexibility in user authentication and authorization.

## Application-level Roles

Keycloak allows you to define roles specific to each application (client). These roles make it possible to assign granular permissions to users or groups, controlling access to the application’s features. To create application-level roles:

1. Log in to the Keycloak administration console and select the desired client.
2. Go to the **Roles** section and add the required roles.
3. Assign the roles to users or groups via the **Users** or **Groups** section.

The JWT token issued for the user will include the assigned roles, which can then be checked by the application to authorize operations.

## Exposing Custom Attributes

Keycloak allows you to add custom attributes to users (for example, department, access level, preferences). These attributes can be included in tokens through **protocol mappers**:

1. Add the desired attributes to the user profile.
2. In the client, go to **Mappers** and create a new mapper of type “User Attribute”.
3. Configure the mapper to include the attribute in the token.

This feature is useful for enriching the information available to the application without having to make additional calls to the backend.

## Strong Authentication Methods

To increase security, Keycloak supports multi-factor authentication (MFA), such as OTP via mobile app or email. To enable MFA:

1. Go to **Authentication** and configure a new authentication flow that includes the OTP step.
2. Set the flow as the default for the realm or for specific users/groups.

Users will be guided through configuring the second factor at their next login, improving account protection.

## Integration with External SSO Systems

Keycloak can federate identities from external providers (e.g., LDAP, Active Directory, Google, SAML). To configure the integration:

1. Go to **Identity Providers** and add the desired provider.
2. Enter the required information (endpoint, client ID, secret, etc.).
3. Map attributes and roles according to the application’s needs.

This integration allows users to authenticate through existing systems, simplifying identity management and improving the user experience.
