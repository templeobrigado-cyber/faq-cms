export const config = {
  matcher: '/(.*)',
}

export default function middleware(request) {
  const basicAuth = request.headers.get('authorization')

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1]
    const [user, pwd] = atob(authValue).split(':')

    if (user === 'admin' && pwd === 'admin2026@1') {
      return
    }
  }

  return new Response('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="FAQ-CMS"',
    },
  })
}
