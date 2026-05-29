import { NextRequest, NextResponse } from 'next/server';

// Parses BASIC_AUTH_USERS ("user1:pass1,user2:pass2") into [["user1","pass1"], ...].
// Falls back to legacy BASIC_AUTH_USER + BASIC_AUTH_PASSWORD for backwards compat.
function loadCredentials(): Array<[string, string]> {
  const multi = process.env.BASIC_AUTH_USERS;
  if (multi) {
    return multi
      .split(',')
      .map(pair => pair.trim())
      .filter(Boolean)
      .map(pair => {
        const idx = pair.indexOf(':');
        return idx === -1 ? null : [pair.slice(0, idx), pair.slice(idx + 1)] as [string, string];
      })
      .filter((p): p is [string, string] => p !== null);
  }
  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;
  return user && password ? [[user, password]] : [];
}

export function middleware(req: NextRequest) {
  const credentials = loadCredentials();

  if (credentials.length === 0) {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get('authorization');
  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1] ?? '';
    const [user, password] = atob(authValue).split(':');
    const match = credentials.some(([u, p]) => u === user && p === password);
    if (match) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Toothpillow Dashboard"',
    },
  });
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
