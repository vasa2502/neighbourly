import { type ReactNode } from "react";
import { useUserRole, type CommunityRole } from "@/hooks/useUserRole";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Lock } from "lucide-react";

interface RoleGateProps {
  children: ReactNode;
  /** Only these roles can see the content. If empty, all authenticated residents can see it. */
  allowedRoles?: CommunityRole[];
  /** If true, require the user to be verified */
  requireVerified?: boolean;
  /** Optional fallback to show when access is denied */
  fallback?: ReactNode;
}

/**
 * Renders children only if the user has the required role in their community.
 * Used to gate admin features, founder features, etc.
 */
export function RoleGate({ children, allowedRoles, requireVerified, fallback }: RoleGateProps) {
  const { data: roleInfo, isLoading } = useUserRole();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[hsl(155,45%,32%)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Check role access
  if (allowedRoles && allowedRoles.length > 0 && roleInfo) {
    if (!allowedRoles.includes(roleInfo.role)) {
      return fallback ?? <AccessDenied message="You don't have access to this section." />;
    }
  }

  // Check verification
  if (requireVerified && roleInfo && !roleInfo.verified) {
    return fallback ?? <AccessDenied message="You need to verify your residency first." />;
  }

  return <>{children}</>;
}

function AccessDenied({ message }: { message: string }) {
  return (
    <Card className="max-w-md mx-auto mt-8">
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold text-foreground mb-2">Access Restricted</h3>
        <p className="text-sm text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  );
}
