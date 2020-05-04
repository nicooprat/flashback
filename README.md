# FlashBack

## Usage

This is a cross-browser extension that allows to quickly search through recent history (up to one year in the past):

* Simply hit `CTRL/CMD + SHIFT + Y` in your browser
* Search for one or more words
* Navigate through the list with `UP/DOWN` arrows
* Git `ENTER` to open the link in current tab
* or `CTRL/CMD + ENTER` to open it in a new tab
* or `ALT + ENTER` to only copy focused URL

## Installation

Get the [Firefox addon](https://addons.mozilla.org/…/flash-back) or the [Chrome extension](https://chrome.google.com/webstore/detail/bpipomgijekodpcdlgchaginebdbjpog/publish-accepted?authuser=0&hl=fr).

## Privacy

This extension needs access to `history` and `tabs`. You're welcome to read the source code to be sure no informations get out of your browser when using it.

## Contributing

If you want to fix a bug or add a feature, open an issue or be welcome to do it yourself:

1. Clone the repo
1. `npm install` then `npm run watch:dev`
1. Import the folder in your browser extension tab (mode developer on)
1. Code, commit and open a pull request in this repo

You probably don't need it but you can also:

* Run `npm run build` to build files in the `dist` folder.
* Run `npm run build-zip` to create an archive of the extension.
