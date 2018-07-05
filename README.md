# bitbar-nightscout
Show blood sugar history and live data from nightscout in your macOS task bar via this bitbar plugin.

Shows last 3 hours data, trend, delta from last reading, insulin on board, carbs, battery and minutes since last data.

![](https://dl.dropbox.com/s/xfgtfhqvzxb4apc/Screenshot%202018-07-05%2012.55.44.png)

![](https://dl.dropbox.com/s/rpacazbnmcpbdp6/Screenshot%202018-07-05%2012.55.50.png)

https://getbitbar.com/



To add to bitbar:  clone, `yarn|npm install` then create `nightscout.30s.sh` (to check every 30 secs):

```
#!/bin/bash
/usr/local/bin/node ~/bitbar/bitbar-nightscout/nightscout.js
```

