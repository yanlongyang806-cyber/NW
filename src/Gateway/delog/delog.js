'use strict';

var fs = require("fs");
var reader = require("buffered-reader");
var DataReader = reader.DataReader;
var count = 0;

// 130501 18:12:31  15210 GatewayServer[400000000]: LOG: ClientSessionStats: account 6084868, addr 216.254.186.154, magic 2059333990, sid tCFmiaV+WfvkXR+XbSO/VPUj, duration 28s, CharacterSelect 1, ProfessionCollectReward 1, ProfessionStartTask 1

// time, sequence, server instance, account, ip, magic, sid, duration, rest
var e = 1;
var TIME = e++,
    SEQ = e++,
    INST = e++,
    ACCOUNT = e++,
    IP = e++,
    MAGIC = e++,
    SID = e++,
    DURATION = e++,
    REST = e++;


var reLogLine = /^(\d+ \d\d:\d\d:\d\d)\s+(\d+)\s+GatewayServer\[(\d+)\]: LOG: ClientSessionStats: account (\d+), addr (\d+\.\d+\.\d+\.\d+), magic (\d+), sid ([^ ]+), duration (\d+)s, (.*)$/;

var g_all = [];
var g_users = {};
var g_statNames = {};

var load = function (file, cb) {
    var lines = [];
    new DataReader(file, { encoding: "utf8" })
        .on("error", function (error){
            cb(error, null);
        })
        .on("line", function (line){
            var res = reLogLine.exec(line);
            if(res && res[TIME] >= '130430 16:00:00')
            {
                // user aggregate
                if(!g_users[res[ACCOUNT]])
                {
                    g_users[res[ACCOUNT]] = {
                        account: res[ACCOUNT],
                        ips: [ res[IP] ],
                        ipCount: 1,
                        duration: 0,
                        sessions: 0,
                        stats: {}
                    };
                }
                var user = g_users[res[ACCOUNT]];

                user.duration += +res[DURATION];
                user.sessions++;

                if(user.ips.indexOf(res[IP]) === -1)
                {
                    user.ips.push(res[IP]);
                    user.ipCount++;
                }
                // end user aggregate

                //
                var lineAll = {
                    time: makeTime(res[TIME], res[SEQ]),
                    server: makeServer(res[INST]),
                    account: res[ACCOUNT],
                    ip: res[IP],
                    magic: res[MAGIC],
                    duration: res[DURATION],
                    stats: {}
                };

                var stats = res[REST].split(', ');
                stats.forEach(function(item, idx, arr) {
                    if(!item)
                        return;

                    var keyval = item.split(/\s+/);
                    var key = keyval[0];
                    var val = parseInt(keyval[1], 10)
                    user.stats[key] = user.stats[key] ? user.stats[key]+val : val;

                    lineAll.stats[key] = val;

                    g_statNames[key] = g_statNames[key] ? 1+g_statNames[key] : 1;
                });

                g_all.push(lineAll);
            }

            count++;
            if(count % 10000 === 0)
                process.stdout.write('.');
//            if(count > 8000)
//                this.interrupt();
        })
        .on("end", function (){
            cb(null, lines);
        })
        .read();
};

var s_lastTime = 0;
var s_ms = 1;
e = 1;
var YY = e++,
    MM = e++,
    DD = e++,
    HHMMSS = e++;
var reTime = /(\d\d)(\d\d)(\d\d) (\d\d:\d\d:\d\d)/;
function makeTime(str, seq)
{
    // YYMMDD HH:MM:SS to MM/DD/YYYY HH:MM:SS
    var res = reTime.exec(str);

    return res[MM] + '/' + res[DD] + '/20' + res[YY] + ' ' + res[HHMMSS];
}

function makeServer(val)
{
    if(val < 200000000)
    {
        return 'Dragon'
    }

    if(val < 300000000)
    {
        return 'Mindflayer'
    }

    if(val < 400000000)
    {
        return 'Dungeon'
    }

    if(val < 500000000)
    {
        return 'Beholder'
    }

    return 'Unknown'
}


function makeAggCSV()
{
    var out = [];

    var statNames = Object.keys(g_statNames).sort();

    var header = '"account","duration(days)","ipCount","sessions"';
    statNames.forEach(function(name) {
        header += ',"'+name+'"';
    });

    out.push(header);
    Object.keys(g_users).forEach(function(key) {
        var line = [];
        var item = g_users[key];
        line.push(item.account);
        line.push((item.duration/60/60/24).toPrecision(5));
        line.push(item.ipCount);
        line.push(item.sessions);
        statNames.forEach(function(name) {
            line.push(item.stats[name] ? item.stats[name] : 0);
        });

        out.push(line.join(','));
    });

    return out.join('\n');
}


function makeLineCSVs()
{
    var i;

    var statNames = Object.keys(g_statNames).sort();

    var header = '"time","account","duration(days)","ip","magic","server"';
    for(i = 0; i < statNames.length; i++)
    {
        header += ',"'+statNames[i]+'"';
    }

    var date = g_all[0].time.slice(0, 5);

    var out = [];
    out.push(header);
    for(var j = 0; j < g_all.length; j++)
    {
        var item = g_all[j];

        if(item.time.slice(0, 5) != date)
        {
            date = date.replace('/', '');
            if(out.length > 1)
                fs.writeFileSync('2013'+date+'.csv', out.join('\n'));

            out = [];
            out.push(header);
            date = item.time.slice(0, 5);
        }

        var line = [];
        line.push(item.time);
        line.push(item.account);
        line.push((item.duration/60/60/24).toPrecision(5));
        line.push(item.ip);
        line.push(item.magic);
        line.push(item.server);
        for(i = 0; i < statNames.length; i++)
        {
            line.push(item.stats[statNames[i]] ? item.stats[statNames[i]] : 0);
        }

        out.push(line.join(','));
    }

    date = date.replace('/', '');
    if(out.length > 1)
        fs.writeFileSync('2013'+date+'-partial.csv', out.join('\n'));
}

load(process.argv[2], function (error, lines) {
    if(error) return console.log(error);

    fs.writeFileSync('user.csv', makeAggCSV());
    g_users = undefined;
    makeLineCSVs();
});

