all: min tst

tst:
	npm test

min:
	uglifyjs promiscuous.js -m -r 'Promise,Deferred' --comments -o dist/promiscuous.js