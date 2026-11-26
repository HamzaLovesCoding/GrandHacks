# GrandHacks visual review

Production build captured in Chrome. Mobile captures use touch emulation. Each link opens the original viewport-sized PNG.

| View | Desktop · 1440 × 900 | Mobile · 390 × 844 |
| --- | --- | --- |
| Cold loader | [PNG](1440/00-loader.png) | [PNG](390/00-loader.png) |
| Hero and countdown | [PNG](1440/01-hero.png) | [PNG](390/01-hero.png) |
| Registration information | [PNG](1440/02-registration.png) | [PNG](390/02-registration.png) |
| Full-screen navigation | — | [PNG](390/03-menu.png) |
| About | [PNG](1440/04-about.png) | [PNG](390/04-about.png) |
| Registration call to action | [PNG](1440/05-register-cta.png) | [PNG](390/05-register-cta.png) |
| Build directory | [PNG](1440/06-build.png) | [PNG](390/06-build.png) |
| 27H idea field | [PNG](1440/07-dot-field.png) | [PNG](390/07-dot-field.png) |
| Track rows | [PNG](1440/08-tracks.png) | [PNG](390/08-tracks.png) |
| Idea generator | [PNG](1440/09-idea-machine.png) | [PNG](390/09-idea-machine.png) |
| Top 3 Overall | [PNG](1440/10-prizes.png) | [PNG](390/10-prizes.png) |
| Award grid | [PNG](1440/11-awards.png) | [PNG](390/11-awards.png) |
| Sponsorship call to action | [PNG](1440/12-sponsor-cta.png) | [PNG](390/12-sponsor-cta.png) |
| Schedule entrance | [PNG](1440/13-schedule.png) | [PNG](390/13-schedule.png) |
| Overnight | [PNG](1440/14-overnight.png) | [PNG](390/14-overnight.png) |
| Day 2 | [PNG](1440/15-day-two.png) | [PNG](390/15-day-two.png) |
| Registration band | [PNG](1440/16-register-band.png) | [PNG](390/16-register-band.png) |
| Sponsors and statistics | [PNG](1440/17-sponsors.png) | [PNG](390/17-sponsors.png) |
| FAQ heading | [PNG](1440/18-faq.png) | [PNG](390/18-faq.png) |
| Draggable questions | [PNG](1440/19-questions.png) | [PNG](390/19-questions.png) |
| FAQ accordion | [PNG](1440/20-accordion.png) | [PNG](390/20-accordion.png) |
| Footer entrance | [PNG](1440/21-footer.png) | [PNG](390/21-footer.png) |
| Footer links | [PNG](1440/22-footer-links.png) | [PNG](390/22-footer-links.png) |
| Active track preview | [PNG](1440/23-active-track.png) | [PNG](390/23-active-track.png) |
| Award overlay | [PNG](1440/24-award-overlay.png) | [PNG](390/24-award-overlay.png) |
| Expanded FAQ answer | [PNG](1440/25-faq-answer.png) | [PNG](390/25-faq-answer.png) |

## Local review

Run `npm run build` followed by `npm start`. Open [the local site](http://localhost:3000).

Event copy comes from the [GrandHacks source revision](https://github.com/HamzaLovesCoding/GrandHacksWebsite/tree/c92e31a7072b54968640871130ae09512458348a). The skyline, podium, and medal illustrations are local code. The only reserved media spaces are the six sponsor slots.

## Verification

The production build and TypeScript check passed. At both viewport sizes the browser checks covered all eight tracks, six idea points, six awards, six information panels, seven FAQ answers, six direct section links, and focus and scroll restoration. Both runs recorded only local requests and zero page errors. Additional checks covered fast scrolling down and back, orientation changes, and the static reduced-motion state.

Automated WCAG A/AA checks reported zero violations on the homepage, registration panel, and award overlay at both sizes. Background sampling behind the hero caption gave minimum contrast ratios of 6.27:1 on desktop and 6.60:1 on mobile. The large wordmark measured 3.06:1 and 3.25:1 respectively.

The case-insensitive scan of project files and production output returned zero matches for 31 retired terms, including all 23 former client names. Git history and installed packages were excluded. The color audit found zero excluded hues across 90 distinct RGB values in source and compiled styles and zero excluded-hue pixels across 40,958,160 screenshot pixels.
