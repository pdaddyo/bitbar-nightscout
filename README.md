# UPDATE - bitbar is no longer a supported app on modern macs
## also the canvas api used for graph is deprecated 
## Here is a simple plugin script for bitbar's replacement: https://xbarapp.com/
### First install `fx` with `brew install fx` 
#### Create a file called `nightscout.50s.sh` in your xbar plugins folder and add the following with YOUR_NIGHTSCOUT_URL:

```
#!/usr/bin/env bash
curl -s https://{YOUR_NIGHTSCOUT_URL}/pebble | /opt/homebrew/bin/fx \
   'x => ({sgv: x.bgs[0].sgv, delta: x.bgs[0].bgdelta, plusminus: x.bgs[0].bgdelta >= 0 ? `+` : ``, mins: Math.round((x.status[0].now - x.bgs[0].datetime) / 1000 / 60)})' \
   'x => ({...x, delta: `${x.plusminus}${x.delta}`, color: x.sgv < 4 ? "red" : x.sgv > 12 ? "orange" : "#eeeeee"})' \
   'x => x.mins > 15 ? `${x.mins}m  (${x.sgv}) | color=red | size=11` : `${x.sgv}  ${x.delta}  ${x.mins}m | color=${x.color}`'
```

### Finally run command `chmod +x nightscout.50s.sh` and you should be good to go!


It will look like this, with red text for lows and orange for highs: 

<img width="277" alt="Screenshot 2024-05-20 at 20 01 24" src="https://github.com/pdaddyo/bitbar-nightscout/assets/7074964/9a1b7b05-6fee-4801-b214-9a84af20b138">


Thanks! 

Paul



## original plugin:

# bitbar-nightscout
Show blood sugar history and live data from Nightscout (http://www.nightscout.info) in your macOS task bar via this bitbar plugin.

Shows last 3 hours data, trend, delta from last reading, insulin on board, carbs, battery and minutes since last data.

![](https://dl.dropbox.com/s/lzvmbx5sbx7eivf/Screenshot%202018-07-05%2013.15.29.png)

![](https://dl.dropbox.com/s/tn0j16zpxprrttu/Screenshot%202018-07-05%2013.15.38.png)

https://getbitbar.com/



To add to bitbar:  clone, `yarn|npm install` then create `nightscout.30s.sh` (to check every 30 secs):

```
#!/bin/bash
/usr/local/bin/node ~/bitbar/bitbar-nightscout/nightscout.js
```

