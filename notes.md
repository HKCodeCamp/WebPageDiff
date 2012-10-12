# Get Started Developing

- Open Window > Extensions.
- Check Developer mode box.
- Click the Load unpacked extension button.  A file dialog appears.
- In the file dialog, navigate to WebPageDiff and click OK.
- Click on `_generated_background_page.html`.  Welcome to a REPL.
- Visit a page in a new tab.
- Find the green puzzle browser action button.
- Click on it.  With any luck, the html for the page will show up in the log.

# Interesting Chrome Extension Docs

[Overview](http://developer.chrome.com/extensions/overview.html) of the technology.
	Set things up in the [Manifest File](http://developer.chrome.com/extensions/manifest.html).
	Click on a Browser Action Button to add a page to Web Page Diff.
	[Background Pages](http://developer.chrome.com/extensions/background_pages.html) serves as our worker process.
		In the future we would use [Event Pages](http://developer.chrome.com/extensions/event_pages.html) but the periodic [alarms api](http://developer.chrome.com/extensions/alarms.html) "requires Google Chrome dev channel or newer".
	[Content Scripts](http://developer.chrome.com/extensions/content_scripts.html) patch an already loaded page.

Look at the [Tutorial to Get Started](http://developer.chrome.com/extensions/getstarted.html).  Follow with the [Debugging Tutorial](http://developer.chrome.com/extensions/tut_debugging.html).

Steal code from [Samples](http://developer.chrome.com/extensions/samples.html).

[chrome.* API](http://developer.chrome.com/extensions/api_index.html)

[XMLHTTPRequest](http://developer.chrome.com/extensions/xhr.html) basics.

