# Deployment Guide

1. Setup a web server. For example Apache. Don't forget to enable SSL encryption.

2. Make sure `yarn` is installed on your system: https://yarnpkg.com/getting-started/install
  
  On debian:
  ```sh
  curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add
  -
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
  apt purge cmdtest
  apt update
  apt install yarn
  ```

3. Make sure `git` is installed.
  On debian:
  ```sh
  apt install git
  ```

3. Setup a user to execute the booking service.
  On Debian, you can do it like this:

  ```sh
  adduser booking
  usermod -L booking             # prevent login for this user
  loginctl enable-linger booking # allow services to execute even if no one is logged in
  ```

4. Switch to your user.
  On debian:
  ```sh
  machinectl shell --uid=booking
  ```

5. Download the repository:
  ```sh
  git clone https://github.com/ahbnr/booking.git
  ```

6. Configure your booking service

  Create a file `booking/frontend/.env` and set the URL where the frontend will
  be served:
  ```sh
  PUBLIC_URL=https://mydomain.com/booking
  ```

  Set additional configuration options in
  * `frontend/src/booking-frontend.config.ts`
  * `backend/src/booking-backend.config.ts`
  * `common/src/booking-common.config.ts`

7. Install Dependencies & Build
  ```sh
  cd booking
  yarn install
  yarn workspace common build
  yarn workspace frontend build
  yarn workspace backend build
  ```

8. Setup systemd user services:

  Create the folder to store the service files
  ```sh
  mkdir -p .config/systemd/user
  ```

  Create a service file
  `.config/systemd/user/booking-frontend.service` for the frontend and add the
  following content:
  ```systemd
  [Unit]
  Description=Booking Frontend Service (https://github.com/ahbnr/booking/)

  [Service]
  Type=simple
  Restart=always
  RestartSec=5
  RemainAfterExit=yes
  WorkingDirectory=/home/booking/booking
  ExecStart=/usr/bin/yarn workspace frontend start-prod

  [Install]
  WantedBy=default.target
  ```

  Create a service file
  `.config/systemd/user/booking-backend.service` for the frontend and add the
  following content:
  ```systemd
  [Unit]
  Description=Booking Backend Service (https://github.com/ahbnr/booking/)

  [Service]
  Type=simple
  Restart=always
  RestartSec=5
  RemainAfterExit=yes
  WorkingDirectory=/home/booking/booking
  ExecStart=/usr/bin/yarn workspace backend start-prod

  [Install]
  WantedBy=default.target
  ```

9. Enable & start the services

  ```sh
  systemctl --user enable booking-frontend
  systemctl --user start booking-frontend
  systemctl --user enable booking-backend
  systemctl --user start booking-backend
  ```

10. Setup your web server to reverse proxy the booking frontend and backend

    IF YOU ARE USING APACHE:
    
    Somewhere in `/etc/apache2/sites-available` there should be the configuration
    file for your web server.
    Inside your `<VirtualHost ...>` declaration, add the following lines:
    ```
    # Allow accessing booking server through reverse proxy at /booking
    ProxyPreserveHost On
    RewriteEngine On

    RewriteRule ^/booking/api/(.*) http://localhost:3000/$1 [P,L]
    ProxyPassReverse /booking/api/ http://localhost:3000/
    
    RewriteRule ^/booking(/(.*))? http://localhost:8000/$2 [P,L]
    ProxyPassReverse /booking/ http://localhost:8000/
    ProxyPassReverse /booking http://localhost:8000/
    
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"
    ```
    
    If you are using `mod_security` and/or the OWASP rules, then you might want to deactivate some of the rules which
    cause false positives and result in `FORBIDDEN` responses:
    ```
    # Needed to disable some security rules to make booking work through the reverse proxy
    <LocationMatch "/booking/api">
            SecRuleRemoveById 980130
            SecRuleRemoveById 949110
    </LocationMatch>
    ```
    In general, if the reverse proxy fails for some requests, this can be a sign of `mod_security` interfering.
    Check the apache error log in this case.
    (TODO: We need to check why booking triggers these rules, and whether there is a better solution than just removing these security rules.)
    
    Restart your apache service:
    ```sh
    systemctl restart apache2
    ```

    This will make the booking frontend available under `/booking` and  the backend
    under `/booking/api`.
    
    IF YOU ARE USING NGINX:
    
    Add this to your `server` block:
    ```
    location /booking/ {
        proxy_pass 'http://localhost:8000/';
    }

    location /booking/api/ {
        proxy_pass 'http://localhost:3000/';
    }
    ```
    
    if you are using selinux, you might also need to allow nginx to reverse proxy:
    ```sh
    setsebool -P httpd_can_network_connect 1
    ```
    
    Then restart your nginx service:
    ```sh
    systemctl restart nginx
    ```
