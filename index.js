const SlackBot = require('slackbots');
const schedule = require('node-schedule');
const moment = require('moment');
const fetch = require('node-fetch');
const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const channel = 'general';
const port = process.env.PORT || 8080;

const bot = new SlackBot({
	token: process.env.SLACK_TOKEN,
	name: 'course'
});

app.use(express.static('public'));
app.get('/', (req, res) => res.send('Hello World!'));

app.listen(port, () => console.log(`App listening on port ${port}!`));

bot.on('start', function () {
	console.log('bot started');
	console.log('local time:', moment().format());

	const getUpcomingCalanderItems = () => {
		return fetch(`https://moodle.rj.ost.ch/webservice/rest/server.php?wstoken=${process.env.MOODLE_TOKEN}&wsfunction=core_calendar_get_calendar_upcoming_view&moodlewsrestformat=json`)
		.then(res => {
			console.log('got moodle data');
			return res.json()
		}).catch(err => console.error('error while fetching moodle data', err));
	};

	const convertDates = events => {
		return events.map(event => {
			let date = new Date(0);
			date.setUTCSeconds(event.timestart);
			event.date = date;
			let endDate = new Date(0);
			endDate.setUTCSeconds(event.timestart + event.timeduration);
			event.endDate = endDate;
			return event;
		});
	};

	const filterOnlyNextEvent = events => {
		let byDate = {};
		for (let event of events) {
			let dateString = event.date.toLocaleDateString();
			if (byDate[dateString]) {
				byDate[dateString].push(event);
			} else {
				byDate[dateString] = [event];
			}
		}

		return Object.keys(byDate).reduce((arr, key, index, array) => {
			if (index < 2) {
				let obj = {};
				obj[key] = byDate[key];
				arr.push(obj);
			}
			return arr;
		}, []);
	};

	const getAnnouncement = dates => {
		return dates.map(date => {
			return date[Object.keys(date)[0]].map(event => {
				let formattedDate = moment(event.date).format('dddd, D. MMMM ');
				let startTime = moment(event.date).format('HH:mm');
				let endTime = moment(event.endDate).format('HH:mm');
				console.log(event.date);
				return `:unicorn_face: *${formattedDate}*\n:clock430: ${startTime} - ${endTime}\n:money_with_wings: ${event.name} ${event.description.replace('<br />', '')}\n\n`;
			}).join('\n');
		}).join('\n');
	};

	const scheduler = async () => {
		let calendarItems = await getUpcomingCalanderItems();
		let events = convertDates(calendarItems.events);

		let today = moment();
		let firstDate = moment(events[0].date);

		// only send if the next date is in this week!
		if (firstDate.diff(today, 'days') < 5) {
			let relevantEvents = filterOnlyNextEvent(events);
			let announcement = `Good news everyone! Here's our upcoming classes:\n${getAnnouncement(relevantEvents)}`;
			console.log(announcement);
			bot.postMessageToChannel(channel, announcement);
		}

	};

	// todo: write /course in chat and get the infos for next week
	// every thursday at half past 9 - 30 09 * * 4
	schedule.scheduleJob('30 09 * * 4', function () {
		scheduler().then(() => console.log('sent schedule'));
	});

}).on('error', (err) => {
	console.log('Error: ' + err.message);
});
