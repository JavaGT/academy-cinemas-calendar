import fetch from 'node-fetch';
import ics from 'ics';
import { writeFile } from 'fs/promises'

const html = await fetch(`https://www.academycinemas.co.nz/5-wednesday`).then(res => res.text());
// const root = parseHTML(html);
const string = /movieData = \[(.+)\],\n/mgs.exec(html)[1];
// eval(`const movie_data = [${string}]`);

const data = new Function(`return [${string}]`)
const films = data().filter(film => film.sessionList.length)
writeFile(`./films.json`, JSON.stringify(films, null, 2))

function parseTimeString(timeString) {
    // Split the string into hours and minutes.
    var timeParts = timeString.split(":");
    var hours = parseInt(timeParts[0]);
    var minutes = parseInt(timeParts[1]);

    // Check if the string includes "pm" and add 12 to the hours if it does.
    if (timeString.indexOf("pm") !== -1 && hours < 12) {
        hours += 12;
    }

    // Return the hours and minutes as an object.
    return [hours, minutes];
}

const sessions = []
films.forEach(film => {
    film.sessionList.forEach(session => {
        const [year, month, day] = session.date.split('-').map(Number)
        session.times.forEach(time => {
            const [hour, minute] = parseTimeString(time.time)
            sessions.push({
                title: film.title,
                start: [year, month, day, hour, minute],
                duration: { minutes: parseInt(/(\d+)/g.exec(film.duration)[1]) },
                description: `${film.title}
${film.releaseDate.slice(0, 4)} ${film.rating}
${film.synopsis}
${time.bookingLink}`,
            })
        })
    })
})

const { error, value } = ics.createEvents(sessions)
writeFile(`./events.ics`, value)