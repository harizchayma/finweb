import React from "react";
import moment from "moment";
import "moment/locale/fr"; 
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";

moment.locale("fr");
const localizer = momentLocalizer(moment);

const messagesFr = {
  next: "Suivant",
  previous: "Précédent",
  today: "Aujourd'hui",
  month: "Mois",
  week: "Semaine",
  day: "Jour",
  agenda: "Agenda",
  date: "Date",
  time: "Heure",
  event: "Événement",
  allDay: "Toute la journée",
  showMore: (num) => `+${num} plus`,
};

const FrenchCalendar = ({ events, onEventDoubleClick }) => {
  return (
    <Calendar
      localizer={localizer}
      events={events}
      startAccessor="start"
      endAccessor="end"
      style={{ height: "75vh" }}
      messages={messagesFr}
      eventPropGetter={(event) => ({
        style: {
          backgroundColor: event.style?.backgroundColor || "#3174ad",
          color: event.style?.color || "white",
        },
      })}
      onSelectEvent={onEventDoubleClick} 
    />
  );
};

export default FrenchCalendar;