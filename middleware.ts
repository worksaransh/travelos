import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// TODO: role-based route protection — see
// JourneyOS_Phase11_Development_Architecture.md §11.7. Real logic
// (Super-Admin-only gating on /admin/dna-config and /admin/roles, reading
// from the same permissions source as the nav-rendering hook) is
// implemented in Stage H. For now this stub allows all requests through
// unchanged.
export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/agent/:path*", "/admin/:path*", "/account/:path*"],
};
