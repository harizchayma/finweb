// MonMoisPersonnalise.js
import React from 'react';
import { chunk } from 'lodash'; // Utile pour organiser les jours en semaines
import moment from 'moment';

const MonMoisPersonnalise = ({ date, localizer, ...props }) => {
  const debutDuMois = moment(date).startOf('month');
  const finDuMois = moment(date).endOf('month');
  const debutDeLaSemaine = moment(debutDuMois).startOf('week');
  const finDeLaSemaine = moment(finDuMois).endOf('week');

  const jours = [];
  let jourActuel = moment(debutDeLaSemaine);

  while (jourActuel.isSameOrBefore(finDeLaSemaine, 'day')) {
    jours.push(jourActuel.clone());
    jourActuel.add(1, 'day');
  }

  const semaines = chunk(jours, 7);

  return (
    <div className="rbc-month-view">
      <div className="rbc-row rbc-month-header">
        {moment.weekdays().map((nomJour, index) => (
          <div key={index} className="rbc-header">
            {nomJour} {/* Afficher les noms complets ici */}
          </div>
        ))}
      </div>
      {semaines.map((semaine, index) => (
        <div key={index} className="rbc-row rbc-month-row">
          {semaine.map(jour => (
            <div
              key={jour.format('YYYY-MM-DD')}
              className={`rbc-day-bg ${jour.isSame(moment(), 'day') ? 'rbc-today' : ''} ${jour.isSame(date, 'month') ? '' : 'rbc-off-range'}`}
            >
              <span className="rbc-date-value">{jour.format('D')}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MonMoisPersonnalise;
