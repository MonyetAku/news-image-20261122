[![make.fun](https://make.fun/badge/news-image-20261122.svg)](https://make.fun/bounty/news-image-20261122)
[![Rank](https://make.fun/badge/news-image-20261122/MonyetAku/news-image-20261122/rank.svg)](https://make.fun/bounty/news-image-20261122)
[![Reward](https://make.fun/badge/news-image-20261122/MonyetAku/news-image-20261122/reward.svg)](https://make.fun/bounty/news-image-20261122)

# The World in One Day — Sunday, 22 November 2026

A newspaper front page that sums up Sunday 22 November 2026's world news in one
image, drawn entirely in code (no external images, no network, no fonts — a
hand-built 5x7 bitmap font and a hand-rolled PNG encoder, Node 22 stdlib only).

## The stories

- **Lead — COP31 deadlocks over fossil fuels (Antalya).** The climate talks
  ended in deadlock as nations split on phasing out oil and gas. Reported by
  the BBC on 22 November 2026 ("Fight over fossil fuels leaves COP31 climate
  talks in deadlock"), and named the day's biggest international story.
- **Gulf — Tankers hit off Oman.** Two tankers struck off the coast of Oman as
  Gulf tensions rise; Bahrain probes a Patriot interceptor crash. Reported
  22 November 2026 (Times of India / ARY News 12 AM headlines).
- **Baltic — Drones hit a ship in the Baltic.** Finland tightens security after
  a Russian cargo ship is hit in the Gulf of Finland. Reported 22 November
  2026 (Times of India).
- **Sport — India v New Zealand, 1st Test, Wellington.** KL Rahul leads
  India's reply in the Wellington Test. Reported 22 November 2026.
- **Peru — Quake shakes the Andes.** A strong tremor in the Andes, no
  casualties reported. Reported 22 November 2026.
- **Ticker —** EU and Indonesia sign a trade deal covering 730 million people;
  Estonia to close its border with Russia; Anthropic shares slide after its
  IPO; NSW's longest-serving MP, the Rev. Fred Nile, dies aged 92.

Date discipline: every story on the page was reported on 22 November 2026.
Two big stories that were still in the day's headlines but happened earlier —
the Iran drone strike on the Ali Al Salem air base in Kuwait (18 November)
and the Trump–Xi–Putin trilateral in Shenzhen (19 November) — were
deliberately left out, so nothing on the page is dated before 22 November.

## How to run

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This writes `out/entry.png` (1024x1024, PNG). Running it twice produces
byte-identical output.
