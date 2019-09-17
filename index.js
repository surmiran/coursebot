const SlackBot = require('slackbots');
const schedule = require('node-schedule');
const fetch = require('node-fetch');
const auth = require('./auth');
const channel = 'test2';

const bot = new SlackBot({
	token: auth.slackToken,
	name: 'course'
});

bot.on('start', function () {

	const getUpcomingCalanderItems = () => {
		return fetch(`https://moodle.hsr.ch/webservice/rest/server.php?wstoken=${auth.moodleToken}&wsfunction=core_calendar_get_calendar_upcoming_view&moodlewsrestformat=json`)
		.then(res => res.json());
	};

	const scheduler = async () => {
		let calendarItems = await getUpcomingCalanderItems();

		let msg = '';
		// todo: filter only the next two days
		for (let event of calendarItems.events) {
			let date = new Date(0);
			date.setUTCSeconds(event.timestart);
			msg += `${date.toLocaleString()}: ${event.name} \n`;
		}
		console.log(msg);
		bot.postMessageToChannel(channel, msg);
	};

	scheduler().then(() => console.log('done'));

	// todo: write /course in chat and get the infos for next week
	//30 16 * * 5
	/*schedule.scheduleJob('30 09 * * 4', function () {
		var random = arr[Math.floor(Math.random() * arr.length)];
		bot.postMessageToChannel(channel, random);
	});*/

});
