import axios from "axios";
import { DateTime, Duration } from "luxon";

async function main() {
  const baseURL = "http://localhost:3000";
  let client = axios.create({
    baseURL,
  });

  const login_response = await client.post("auth/login", {
    username: "root",
    password: "root",
  });
  client.defaults.headers.cookie = login_response.headers["set-cookie"]!.map(
    (setCookie: string) => setCookie.split(";")[0]
  ).join("; ");

  const auth_response = await client.get("auth/auth_token");
  client.defaults.headers.Authorization = `Bearer ${auth_response.data.authToken}`;

  // Create resource
  await client.post("resources/ResourceA", undefined, {
    validateStatus: undefined,
  });

  const now = DateTime.now();
  const weekdayName = now.weekdayLong.toLowerCase();

  // Create weekday
  const weekday_response = await client.post(
    "resources/ResourceA/weekdays",
    {
      name: weekdayName,
    },
    { validateStatus: undefined }
  );

  let weekdayId: number;
  if (weekday_response.status === 201) {
    weekdayId = weekday_response.data.id;
  } else {
    const weekdays_query = await client.get("resources/ResourceA/weekdays");
    weekdayId = weekdays_query.data.find(
      (weekdayData: any) => weekdayData.name === weekdayName
    ).id;
  }

  // Create timeslot
  const startHours = now.plus(Duration.fromObject({ hours: 1 })).hour;
  const endHours = now.plus(Duration.fromObject({ hours: 2 })).hour;

  let timeslotId = await client
    .get(`weekdays/${weekdayId}/timeslots`)
    .then(
      (res) =>
        res.data.find((timeslot: any) => timeslot.startHours === startHours)?.id
    );
  if (timeslotId == null) {
    const timeslot_response = await client.post(
      `weekdays/${weekdayId}/timeslots`,
      {
        capacity: 5,
        startHours: startHours,
        startMinutes: 0,
        endHours: endHours,
        endMinutes: 0,
      }
    );

    timeslotId = timeslot_response.data.id;
  }

  // Create bookings
  async function createBooking(name: string) {
    await client.post(`timeslots/${timeslotId}/bookings`, {
      name,
      email: "test@test.de",
      lookupUrl: `${baseURL}/`,
      bookingDay: now.toISODate(),
    });
  }

  await createBooking("Max Muster");
  await createBooking("Hessy James");
  await createBooking("Bla Blubb");
}

main().catch((error) => {
  console.log(error.response.status);
  console.log(error.response.data);
});
