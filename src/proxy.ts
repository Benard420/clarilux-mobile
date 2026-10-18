import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PROTECTED = ["/dashboard", "/oral-board", "/marketplace", "/questions", "/more", "/book", "/booking", "/room", "/onboarding", "/notifications"];
const AUTH_ONLY = ["/welcome", "/sign-in", "/sign-up"];
const ALWAYS_OPEN = ["/auth/callback", "/auth/confirm"];

export default async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const path = request.nextUrl.pathname;
  if (ALWAYS_OPEN.some((p) => path.startsWith(p))) return response;

  const { data } = await supabase.auth.getUser();

  if (!data.user && PROTECTED.some((p) => path.startsWith(p))) {
    const to = request.nextUrl.clone();
    to.pathname = "/welcome";
    return NextResponse.redirect(to);
  }

  if (data.user && AUTH_ONLY.some((p) => path.startsWith(p))) {
    const to = request.nextUrl.clone();
    to.pathname = "/dashboard";
    return NextResponse.redirect(to);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|manifest.webmanifest|sw.js|.*\\.png$).*)"],
};
