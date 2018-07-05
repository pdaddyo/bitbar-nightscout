/* 

  Grabs latest data and last 3 hours blood sugar history from 
  nightscout to display on macOS dock via https://getbitbar.com/

  */

const http = require('http')
// this endpoint for the latest details
const url1 = 'http://<YOUR ENDPOINT HERE>/pebble';
// this endpoint for the history graph
const url2 = 'http://<YOUR ENDPOINT HERE>/api/v1/entries.json?count=36';
const { createCanvas } = require('canvas');
const moment = require('moment');
const canvasHeight = 18;
const minVerticalZoom = 4 * 18;
const pixelWidthPerEntry = 1.5;

http.get(url1, function (res1) {
    let body = '';
    res1.on('data', function (chunk) {
        body += chunk;
    });
    res1.on('end', function () {
        const json = JSON.parse(body);
        const { status, bgs, cals } = json;
        const { sgv, trend, direction, datetime, bgdelta, battery, iob, bwp, bwpo, cob } = bgs[0];
        http.get(url2, function (res2) {
            let body2 = '';
            res2.on('data', function (chunk) {
                body2 += chunk;
            });
            res2.on('end', function () {
                const entries = JSON.parse(body2).reverse();
                let maxSgv = 0;
                let minSgv = 1000;
                let trueMin = 1000;
                for (let dataPoint of entries) {
                    var checkSgv = dataPoint.sgv
                    if (checkSgv > maxSgv)
                        maxSgv = checkSgv

                    if (checkSgv < minSgv)
                        minSgv = checkSgv
                }
                trueMin = minSgv
                trueMax = maxSgv
                let delta = 0;
                if ((maxSgv - minSgv) < minVerticalZoom) {
                    delta = (minVerticalZoom - (maxSgv - minSgv)) / 2
                    maxSgv += delta
                    minSgv -= delta
                }

                const dropping = entries[0].sgv > entries[entries.length - 1].sgv
                let bgHigh = String(Math.round(trueMax * 10 / 18) / 10);
                let bgLow = String(Math.round(trueMin * 10 / 18) / 10);
                const textWidth = 27
                const right = (entries.length * pixelWidthPerEntry) + textWidth + 2, top = 8, bottom = 18
                const canvasWidth = textWidth * 1.2 + (entries.length * pixelWidthPerEntry);
                const canvas = createCanvas(canvasWidth, canvasHeight)
                const ctx = canvas.getContext('2d')
                ctx.font = '11px Helvetica Neue'
                ctx.fillStyle = 'rgba(0,0,0,1)'
                ctx.antialias = 'gray';
                const firstEntryTime = moment(entries[0].date).format('H:MM')

                ctx.fillText(bgHigh, bgHigh.length > 3 ? 0 : 8, top)
                ctx.fillText(bgLow, bgLow.length > 3 ? 0 : 8, bottom)

                // shade danger areas
                const safeMin = 4.5 * 18, safeMax = 9 * 18
                const yPosFromSgv = (sgv) => canvasHeight - ((sgv - trueMin + delta) * 1 / (maxSgv - minSgv)) * (canvasHeight - 2) - 1
                if (safeMax < maxSgv) {
                    var gradient = ctx.createLinearGradient(0, yPosFromSgv(safeMax), 0, 0);
                    gradient.addColorStop(0, "rgba(0,0,0,0.15)");
                    gradient.addColorStop(1, "rgba(0,0,0,0.3)");
                    ctx.fillStyle = gradient; //'rgba(0,0,0,0.15)'
                    ctx.fillRect(textWidth + 1, 1, (entries.length * pixelWidthPerEntry) - 2, yPosFromSgv(safeMax))
                }
                if (safeMin > minSgv) {
                    var gradient = ctx.createLinearGradient(0, yPosFromSgv(safeMin), 0, canvasHeight - 1);
                    gradient.addColorStop(0, "rgba(0,0,0,0.15)");
                    gradient.addColorStop(1, "rgba(0,0,0,0.3)");
                    ctx.fillStyle = gradient; //'rgba(0,0,0,0.15)'
                    ctx.fillRect(textWidth + 1, yPosFromSgv(safeMin), (entries.length * pixelWidthPerEntry) - 2, canvasHeight - 1)
                }

                ctx.moveTo(textWidth, yPosFromSgv(entries[0].sgv))
                let index = 0
                for (let dataPoint of entries) {
                    const { sgv, date } = dataPoint
                    ctx.lineTo(((index++) * pixelWidthPerEntry) + textWidth, yPosFromSgv(sgv))
                }
                ctx.stroke()

                const graphWidth = ((entries.length - 1) * pixelWidthPerEntry)
                ctx.strokeStyle = 'rgba(0,0,0,0.5)'
                ctx.rect(textWidth + 1, 0, graphWidth, canvasHeight)
                ctx.stroke()
                // render the graph to base64 for bitbar
                const img = canvas.toDataURL().replace('data:image/png;base64,', '')

                const arrowSymbol = (direction) => {
                    switch (direction) {
                        case 'Flat':
                            return '→'
                        case 'FortyFiveDown':
                            return '↘'
                        case 'SingleDown':
                            return '↓'
                        case 'DoubleDown':
                            return '↓↓'
                        case 'FortyFiveUp':
                            return '↗'
                        case 'SingleUp':
                            return '↑'
                        case 'DoubleUp':
                            return '↑↑'
                        default:
                            return direction
                    }
                }

                // minutes since last pump data
                const mins = Math.round((new Date().getTime() - datetime) / 1000 / 60)
                const strIob = iob > 0 ? ' ' + iob : ''
                const strBwp = bwp > 0 ? ' BWP ' + bwp : ''
                const strTrend = arrowSymbol(direction)
                let color = ''

                if (mins > 15 || bgdelta > 0.8 || sgv > 15 || sgv < 3.8 || direction.indexOf('Double') > 0) {
                    color = 'color=red'
                } else if (mins > 10 || bgdelta > 0.6 || sgv > 13 || sgv < 4.3) {
                    color = 'color=orange'
                }

                console.log(`${sgv}${strTrend} (${bgdelta > 0 ? '+' + bgdelta : bgdelta})${strIob}${strBwp} ${mins}m| templateImage=${img} ${color}`)
                console.log('---')
                console.log('Rig battery: ' + battery + '%')
                console.log('Carbs: ' + cob)
                console.log('BWPO: ' + bwpo)
                console.log('Safe min: ' + Math.round(safeMin * 10 / 18) / 10)
                console.log('Safe max: ' + Math.round(safeMax * 10 / 18) / 10)
            })
        })
    }).on('error', function (e) {
        console.log("HTTP ERROR ", e);
    })
}).on('error', function (e) {
    console.log("HTTP ERROR ", e);
})