'use strict';
var Stencils = {};
Stencils.render = function (name, deref, obj, cb) { return Stencils[name] ? Stencils[name](name, deref, obj,cb) : console.error('Unable to find stencil named "'+name+'"'); }
Stencils["tableau"]=
function tableau(n,d,c,x) {
var h=[];d(n,c,h,[{s:'Round <span data-path=\".round\">'},
{r:'.round'},
{s:'</span>\r\n<div id=\"tooltip\" class=\"tooltip\"></div>\r\n<div class=\"players\" data-path=\"players\">'},
{r:'players',
c:[{s:'\r\n\t<div class=\"player '},
{r:'.id'},
{s:' '},
{r:'.isCurrentPlayer.$choose(player-current,)'},
{s:'\" data-set-class=\"player {.id} {.isCurrentPlayer.$choose(player-current,)}\">\r\n\t\t<h1 data-path=\".name\">'},
{r:'.name',
c:[{s:'Test Name'}
]},
{s:'</h1>\r\n\t\t'},
{i:{ t:[".isCurrentPlayer",".hasActionsToUse"], e:'r[0] && !r[1]'},
c:[{s:'<div class=\"player-actions\" data-if=\"{.isCurrentPlayer} && !{.hasActionsToUse}\">\r\n\t\t\t<a class=\"button end-turn\" onclick=\"mg.endRound(table)\">End Turn</a>\r\n\t\t</div>'}
]},
{s:'\r\n\t\t'},
{i:{ t:[".isCurrentPlayer",".hasActionsToUse"], e:'r[0] && r[1]'},
c:[{s:'<div class=\"player-actions\" data-if=\"{.isCurrentPlayer} && {.hasActionsToUse}\">\r\n\t\t\t<a class=\"button end-turn disabled\">Assign Actions...</a>\r\n\t\t</div>'}
]},
{s:'\r\n\t\t'},
{i:{ t:[".isCurrentPlayer"], e:'r[0]'},
c:[{s:'<div id=\"selecting\" class=\"select-prompt\" data-if=\"{.isCurrentPlayer}\">\r\n\t\t\t<span>Choose wisely...</span>\r\n\t\t</div>'}
]},
{s:'\r\n\t\t<ul class=\"cards\" data-path=\".cards\">'},
{r:'.cards',
c:[{s:'\r\n\t\t\t<li class=\"card '},
{r:'.id'},
{s:' '},
{r:'.$back().id'},
{s:' '},
{r:'.attribs.hitpoints.$choose(,destroyed)'},
{s:' '},
{r:'.isDisabled.$choose(disabled,)'},
{s:'\" data-set-class=\"card {.id} {.$back().id} {.attribs.hitpoints.$choose(,destroyed)} {.isDisabled.$choose(disabled,)}\" data-id=\".'},
{r:'$back().id'},
{s:'.'},
{r:'.id'},
{s:'.\" data-set-data-id=\".{$back().id}.{.id}.\">\r\n\r\n\t\t\t\t<ul class=\"status-list\">\r\n\t\t\t\t\t'},
{i:{ t:[".states.disabled"], e:'r[0]'},
c:[{s:'<li class=\"status\" data-if=\".states.disabled\">Disabled</li>'}
]},
{s:'\r\n\t\t\t\t\t'},
{i:{ t:[".states.confused"], e:'r[0]'},
c:[{s:'<li class=\"status\" data-if=\".states.confused\">Confused</li>'}
]},
{s:'\r\n\t\t\t\t\t'},
{i:{ t:[".states.untargetable"], e:'r[0]'},
c:[{s:'<li class=\"status\" data-if=\".states.untargetable\">Untargetable</li>'}
]},
{s:'\r\n\t\t\t\t\t'},
{i:{ t:[".states.allyUntargetable"], e:'r[0]'},
c:[{s:'<li class=\"status\" data-if=\".states.allyUntargetable\">Allies cannot target</li>'}
]},
{s:'\r\n\t\t\t\t\t'},
{i:{ t:[".states.opponentUntargetable"], e:'r[0]'},
c:[{s:'<li class=\"status\" data-if=\".states.opponentUntargetable\">Foes cannot target</li>'}
]},
{s:'\r\n\t\t\t\t</ul>\r\n\t\t\t\t<h4><span data-path=\".cardDef.name\">'},
{r:'.cardDef.name',
c:[{s:'card name'}
]},
{s:'</span></h4>\r\n\t\t\t\t<div class=\"card-stats\">\r\n\t\t\t\t\t<span class=\"card-stats-left\">\r\n\t\t\t\t\t\t<h6>Shield: <span data-path=\".attribs.shield\">'},
{r:'.attribs.shield',
c:[{s:'10'}
]},
{s:'</span></h6>\r\n\t\t\t\t\t\t<h6>HP: <span data-path=\".attribs.hitpoints\">'},
{r:'.attribs.hitpoints',
c:[{s:'10'}
]},
{s:'</span></h6>\r\n\t\t\t\t\t\t<h6>Accuracy: <span data-path=\".attribs.accuracyRating\">'},
{r:'.attribs.accuracyRating',
c:[{s:'10'}
]},
{s:'</span></h6>\r\n\t\t\t\t\t\t<h6>Evasion: <span data-path=\".attribs.evasionRating\">'},
{r:'.attribs.evasionRating',
c:[{s:'10'}
]},
{s:'</span></h6>\r\n\t\t\t\t\t</span>\r\n\t\t\t\t\t<span class=\"card-stats-right\">\r\n\t\t\t\t\t\t<h6>Speed: <span data-path=\".attribs.speed\">'},
{r:'.attribs.speed',
c:[{s:'10'}
]},
{s:'</span> (<span data-path=\".order\">'},
{r:'.order',
c:[{s:'5'}
]},
{s:'</span>)</h6>\r\n\t\t\t\t\t\t<h6>Attack: <span data-path=\".attribs.attackMin\">'},
{r:'.attribs.attackMin',
c:[{s:'10'}
]},
{s:'</span> to <span data-path=\".attribs.attackMax\">'},
{r:'.attribs.attackMax',
c:[{s:'10'}
]},
{s:'</span></h6>\r\n\t\t\t\t\t\t<h6>Critical: <span data-path=\".attribs.criticalMult\">'},
{r:'.attribs.criticalMult',
c:[{s:'120'}
]},
{s:'</span>x</h6>\r\n\t\t\t\t\t</span>\r\n\t\t\t\t</div>\r\n\r\n\t\t\t\t'},
{i:{ t:[".attribs.hitpoints"], e:'r[0]<=0'},
c:[{s:'<span class=\"destroyed-text\" data-if=\"{.attribs.hitpoints} le 0\">Destroyed</span>'}
]},
{s:'\r\n\r\n\t\t\t\t<ul class=\"card-log\" data-path=\".logLines\">'},
{r:'.logLines',
c:[{s:'\r\n\t\t\t\t\t<li class=\"card-log-line\" data-path=\".\">'},
{r:'.',
c:[{s:'blah'}
]},
{s:'</li>\r\n\t\t\t\t'}
]},
{s:'</ul>\r\n\r\n\t\t\t\t<div class=\"card-actions\" data-path=\".actions\">'},
{r:'.actions',
c:[{s:'\r\n\t\t\t\t\t<a class=\"button action '},
{r:'.canExecute.$choose(,disabled)'},
{s:' '},
{r:'.chosen.$choose(chosen,)'},
{s:'\" data-set-class=\"button action {.canExecute.$choose(,disabled)} {.chosen.$choose(chosen,)}\" data-id=\".'},
{r:'.$back(2).id'},
{s:'.'},
{r:'.$back().id'},
{s:'.'},
{r:'.id'},
{s:'.\" data-set-data-id=\".{.$back(2).id}.{.$back().id}.{.id}.\" data-tt=\"'},
{r:'.actionDef.description'},
{s:'\" data-set-data-tt=\"{.actionDef.description}\">\r\n\t\t\t\t\t\t<div class=\"bar-inner\" style=\"width: '},
{r:'.$cooldownPercent()'},
{s:'%;\" data-set-style=\"width: {.$cooldownPercent()}%;\"></div>\r\n\t\t\t\t\t\t<span class=\"bar-text\">\r\n\t\t\t\t\t\t\t<span data-path=\".actionDef.name\">'},
{r:'.actionDef.name',
c:[{s:'Name'}
]},
{s:'</span>\r\n\t\t\t\t\t\t\t'},
{i:{ t:[".noTargets"], e:'r[0]'},
c:[{s:'<span data-if=\"{.noTargets}\">: no targets</span>'}
]},
{s:'\r\n\t\t\t\t\t\t</span>\r\n\t\t\t\t\t\t<span class=\"right\">\r\n\t\t\t\t\t\t\t'},
{i:{ t:[".actionDef.cooldown"], e:'r[0]>0'},
c:[{s:'<span data-if=\"{.actionDef.cooldown} gt 0\" data-path=\".actionDef.cooldown.$subtract(1)\">'},
{r:'.actionDef.cooldown.$subtract(1)',
c:[{s:'2'}
]},
{s:'</span>'}
]},
{s:'\r\n\t\t\t\t\t\t\t'},
{i:{ t:[".actionDef.cooldown"], e:'r[0]===0'},
c:[{s:'<span data-if=\"{.actionDef.cooldown} eq 0\">0</span>'}
]},
{s:'\r\n\t\t\t\t\t\t</span>\r\n\t\t\t\t\t\t'},
{i:{ t:[".cooldown",".chosen"], e:'r[0]>1 && !r[1]'},
c:[{s:'<span class=\"left\" data-if=\"{.cooldown} gt 1 && !{.chosen}\">in <span data-path=\".cooldown\">'},
{r:'.cooldown',
c:[{s:'2'}
]},
{s:'</span></span>'}
]},
{s:'\r\n\t\t\t\t\t\t'},
{i:{ t:[".cooldown",".chosen"], e:'r[0]===1 && !r[1]'},
c:[{s:'<span class=\"left\" data-if=\"{.cooldown} eq 1 && !{.chosen}\">next turn</span>'}
]},
{s:'\r\n\t\t\t\t\t</a>\r\n\t\t\t\t'}
]},
{s:'</div>\r\n\t\t\t</li>\r\n\t\t'}
]},
{s:'</ul>\r\n\t</div>\r\n'}
]},
{s:'</div>\r\n<script>\r\n\tvar mg = require(\'mg\');\r\n\tvar table = require(\'mgStartup\').table;\r\n</script>\r\n'}
],function(e){x(e,h)});
};
module.exports = Stencils;
