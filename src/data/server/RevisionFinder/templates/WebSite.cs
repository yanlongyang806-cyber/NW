<!DOCTYPE html>
<html lang="en">
    <head>
        <title>RF <?cs var:Version ?> - <?cs var:Instance ?> (AL: <?cs var:Access ?>)</title>
        <meta charset="utf-8">
        <script type="text/javascript" src="/jquery-1.9.0.min.js"></script>
        <script type="text/javascript" src="/jquery-ui-1.10.0.custom.min.js"></script>
        <script type="text/javascript" src="/jquery-ui-timepicker-addon.js"></script>
        <script type="text/javascript" src="/jquery.dataTables.min.js"></script>
        <script type="text/javascript" src="/date.format.js"></script>
        <script type="text/javascript" src="/as.js"></script>
        <link rel="stylesheet" type="text/css" href="/smoothness/jquery-ui-1.10.0.custom.css" media="screen" />
        <link rel="stylesheet" type="text/css" href="/as.css" media="screen" />
        <link rel="stylesheet" type="text/css" href="/jquery.dataTables.css" media="screen" />
        <link rel="stylesheet" type="text/css" href="/jquery-ui-timepicker-addon.css" />
        <link rel="shortcut icon" href="/favicon.ico" />
    </head>
    <body>
        <div id="main">
            <div id="header">
                <h1 class="title"><a href="/" title="Home">Revision Finder <?cs var:Version ?></a></h1>
                <ul id="mainmenu">
                   
                </ul>
            </div>
            <div id="content">
                <?cs var:Content ?>
            </div>
            <div id="footer">
                <p>Version: <?cs var:Version ?></p>
                <p>Build: <?cs var:Buildversion ?></p>
            </div>
        </div>
    </body>
</html>
