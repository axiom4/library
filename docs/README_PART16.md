# A Full Test Application Using Django and Angular (Part 16) - Keycloak Advanced

This chapter delves into some advanced Keycloak features that are fundamental for managing security and integrating applications. In particular, the following topics will be covered:

- **Application-level roles**: we will see how to define and manage roles specific to applications, assigning granular permissions to users and groups.
- **Exposing custom attributes**: we will illustrate how to add and make custom attributes available within tokens, useful for enriching user information and supporting advanced application logic.
- **Strong authentication methods**: we will analyze the options offered by Keycloak to implement multi-factor authentication (MFA) and strengthen access security.
- **Integration with external SSO systems**: we will explain how to configure Keycloak to federate identities and enable access through external providers, facilitating integration with existing infrastructures.

These topics will allow you to fully leverage Keycloak’s capabilities in enterprise scenarios and ensure a high level of security and flexibility in user authentication and authorization.

## Application-level Roles

Keycloak consente di definire ruoli specifici per ciascuna applicazione (client). Questi ruoli permettono di assegnare permessi granulari agli utenti o ai gruppi, controllando l’accesso alle funzionalità dell’applicazione. Per creare ruoli a livello di applicazione:

1. Accedi all’amministrazione Keycloak e seleziona il client desiderato.
2. Vai alla sezione **Ruoli** e aggiungi i ruoli necessari.
3. Assegna i ruoli agli utenti o ai gruppi tramite la sezione **Utenti** o **Gruppi**.

Nel token JWT emesso per l’utente saranno inclusi i ruoli assegnati, che potranno essere verificati dall’applicazione per autorizzare le operazioni.

## Esposizione di Attributi Personalizzati

Keycloak permette di aggiungere attributi personalizzati agli utenti (ad esempio, dipartimento, livello di accesso, preferenze). Questi attributi possono essere inclusi nei token tramite i **protocol mappers**:

1. Aggiungi gli attributi desiderati al profilo utente.
2. Nel client, vai su **Mappers** e crea un nuovo mapper di tipo “User Attribute”.
3. Configura il mapper per includere l’attributo nel token.

Questa funzionalità è utile per arricchire le informazioni disponibili all’applicazione senza dover effettuare ulteriori chiamate al backend.

## Metodi di Autenticazione Forte

Per aumentare la sicurezza, Keycloak supporta l’autenticazione a più fattori (MFA), come OTP via app mobile o email. Per abilitare MFA:

1. Vai su **Authentication** e configura un nuovo flow di autenticazione che includa il passo OTP.
2. Imposta il flow come predefinito per il realm o per specifici utenti/gruppi.

Gli utenti saranno guidati nella configurazione del secondo fattore al prossimo accesso, migliorando la protezione degli account.

## Integrazione con Sistemi SSO Esterni

Keycloak può federare identità da provider esterni (es. LDAP, Active Directory, Google, SAML). Per configurare l’integrazione:

1. Vai su **Identity Providers** e aggiungi il provider desiderato.
2. Inserisci le informazioni richieste (endpoint, client ID, secret, ecc.).
3. Mappa gli attributi e i ruoli secondo le esigenze dell’applicazione.

Questa integrazione consente agli utenti di autenticarsi tramite sistemi già esistenti, semplificando la gestione delle identità e migliorando l’esperienza utente.
