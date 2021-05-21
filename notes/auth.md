# How does authentication / authorization work in this application?

Warning: Please note, that the author of the implementation is not an expert in IT security details, but I tried to do my best.

* For authorization, JWT auth tokens are used
    * any admin action can be performed with such a token
        * for this, they must be present in the header of a request, see OpenAPI spec
    * they contain the necessary data to identify a user and are signed by the server so that they can not be faked
        * hence, on the server-side it suffices to verify that they are correctly signed, no communication with any auth server necessary
    * they are short lived (expiration date, 15 minutes) and are only saved in-memory by the frontend s.t. they can not be easily stolen
        * note, that we should not store them in localstorage, since localstorage can easily be compromised by XSS
        * thats why we use refresh tokens instead, so that a new auth token can be obtained any time
            * ...and the refresh tokens have a better way of storing them persistently than localstorage
    * such a token can be received from the server using a refresh token
    
* To obtain a refresh token, a user must authenticate themselves using password and username with a login request
    * refresh tokens are long-lived (30 days) and stored in HttpOnly cookies
        * i.e. they are not accessible by javascript (protection against theft by XSS attacks)
        * they use the SameSite cookie policy (and we plan to add a CSRF protection cookie (csurf)) so that it is protected against theft through CSRF attacks even on old clients not supporting SameSite cookies) TODO
            * https://security.stackexchange.com/questions/121971/will-same-site-cookies-be-sufficent-protection-against-csrf-and-xss
        * they are stored persistently for the frontend through the cookie and thus survive restarts of the web app (refresh of the browser)
        * CSRF attacks are mostly an issue regarding attackers trying to mutate state on the server.
          In particular, without XSS at the same time, a CSRF attacker can not see the returned data (the auth token).
          
          Hence, storing refresh tokens in HttpOnly cookies is relatively safe while storing auth tokens is not, since
          they allow calls that mutate state on the server.
    * like auth tokens, they are signed by the server, so they can not be faked
    * the server remembers refresh tokens and only accepts those that are in the database (and not expired)
        * this allows to invalidate refresh tokens at any time from the server
            * It is debatable though, if this feature is really necessary for this application...

* an "activation token" is sent together with the refresh token as a cookie.
    * the server remembers the activation token together with the refresh token
    * it must also be sent together with the refresh token to get new auth tokens
    * However, differently than the refresh token, the activation token is not a HttpOnly cookie so it can be deleted by javascript.
        * This allows the frontend to invalidate the refresh credentials by deleting the activation token, even if the backend is offline / not reachable
        * though it can be stolen by XSS, it is useless on its own without the refresh token
    * The refresh token can also be deleted and invalidated by the server using a /auth/logout route
    * the term "activation token" is just a silly invention. Maybe we should rename the two tokens to "refresh token A" and "refresh token B"
        
    
* the frontend automatically tries to obtain authentication tokens whenever they expire using a refresh token, if present.
  Only if the refresh token is not present or expired, the user needs to manually log in again
    
Read also:

* https://hasura.io/blog/best-practices-of-using-jwt-with-graphql/
* https://medium.com/@ryanchenkie_40935/react-authentication-how-to-store-jwt-in-a-cookie-346519310e81

TODO:
* I should watch this and add more guards against XSS and CSRF attacks: https://www.youtube.com/watch?v=M6N7gEZ-IUQ
* Apply anti XSS measures: https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html#xss-prevention-rules
* maybe we really don't need CSRF protection for this kind of application: https://github.com/pillarjs/understanding-csrf