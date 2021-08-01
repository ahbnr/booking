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

    For example, if you are using Apache, then you should be able to setup the reverse proxy like this:
    Somewhere in `/etc/apache2/sites-available` there should be the configuration
    file for your web server.
    Inside your `<VirtualHost ...>` declaration, add the following lines:
    ```
    # Allow accessing booking server through reverse proxy at /booking
    ProxyPreserveHost On
    RewriteEngine On

    RewriteRule ^/booking/api/(.*) http://localhost:3000/$1 [P,L]
    ProxyPassReverse /booking/api/ http://localhost:3000/
    RewriteRule ^/booking/(.*) http://localhost:8000/$1 [P,L]
    ProxyPassReverse /booking/ http://localhost:8000/
    RequestHeader set X-Forwarded-Proto "https"
    RequestHeader set X-Forwarded-Port "443"
    ```
    
    Restart your apache service:
    ```sh
    systemctl restart apache2
    ```

    This will make the booking frontend available under `/booking` and  the backend
    under `/booking/api`.
