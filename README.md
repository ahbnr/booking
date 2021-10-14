![build status](https://github.com/ahbnr/booking/workflows/Booking%20CI/badge.svg?branch=main)
![license](https://img.shields.io/github/license/ahbnr/booking)

# WORK-IN-PROGRESS Booking Service

> Do you offer appointments on a regular basis or have to manage access to resources like meeting rooms for a set of timeslots?
> This project provides a user-friendly, responsive web-ui for booking such resources.

## Features

* manage various resources (conference rooms, support employees, ...)
* offer bookings for different days and time slots
* the number of users which may book a resource is customizable
* group bookings are possible
* users receive confirmation mails for their appointments
  * mail verification possible (optional)
* users can review and cancel their bookings any time, no sign-up necessary
  * a special lookup URL is sent via the confirmation mails
* daily booking overviews are provided to administrators and can also be downloaded as PDF

## Installation & Usage

WIP

## Technology

* the booking service is written in TypeScript and consists of a backend and a frontend component
* the backend consists of a NodeJS express server providing a REST API to manage resources
* the frontend is implemented as a React App

## License

GNU Affero General Public License Version 3, see [LICENSE.txt](LICENSE.txt)
