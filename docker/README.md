# Intro

This Dockerfile is meant for quick testing of changes to the booking system.
It also serves of an example of how a booking system can be installed.
It will set up a complete instance of the booking system with a mariadb server and prepare a set of booking slots.

# Warning

THIS DOCKER SETUP IS NOT SAFE AND NOT INTENDED FOR PRODUCTION USE
because it exposes the database and does not set a database password.

# Setup

Run the following in this folder:
```
sudo docker-compose rm -f db booking
sudo docker-compose build --no-cache
sudo docker-compose up --force-recreate
```

The booking service will be available on `http://localhost:8000`.
The root password is displayed on the console.
It uses `ethereal.email` to simulate email delivery. The mail links are generated in the console output.
