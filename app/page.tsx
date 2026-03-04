import React from 'react';
import { getEvents } from '../src/utils/data';
import { ScheduleClient } from '../components/ScheduleClient';

export default async function Home() {
  // Fetch data on the server side
  const events = await getEvents();

  // Pass it to the interactive client component
  return <ScheduleClient initialEvents={events} />;
}