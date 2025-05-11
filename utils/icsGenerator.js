module.exports = function generateICS(event) {
  const startDate = event.date.replace(/-/g, '') + 'T' + event.time.replace(':', '') + '00Z';
  const endDate = startDate; // assuming 1-hour duration, you can enhance this

  return `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
DTSTART:${startDate}
DTEND:${endDate}
END:VEVENT
END:VCALENDAR`;
};
