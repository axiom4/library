import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { AuthGuardData, createAuthGuard } from 'keycloak-angular';

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;

  const requiredRole = route.data['role'];

  if (!requiredRole) {
    return false;
  }

  const hasRequiredRole = (role: string): boolean =>
    Object.values(grantedRoles.realmRoles).some((roles) =>
      roles.includes(role)
    );

  if (authenticated && hasRequiredRole(requiredRole)) {
    return true;
  }

  return false;
};

export const authGuard: CanActivateFn =
  createAuthGuard<CanActivateFn>(isAccessAllowed);
