<!DOCTYPE html>
<html lang="en">
    <head>
        <title>AS <?cs var:Version ?> - <?cs var:Instance ?> (AL: <?cs var:Access ?>)</title>
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
                <h1 class="title"><a href="/" title="Home">Account Server <?cs var:Version ?></a></h1>
                <ul id="mainmenu">
                    <li class="first"><a href="/accounts/index<?cs var:Extension ?>" title="Accounts">Accounts</a>
                        <ul>
                            <li><a href="/legacy/detail">Details</a></li>
                            <li><a href="/legacy/search">Search</a></li>
                            <li><a href="/legacy/create">Create</a></li>
                            <li><a href="/legacy/changePassword">Change Password</a></li>
                            <li><a href="/accounts/view<?cs var:Extension ?>" title="View Accounts">View</a></li>
							<li><a href="/accounts/employeeStatus<?cs var:Extension ?>" title="Employee Status">Employee Status</a></li>
                            <!-- <li><a href="/accounts/search<?cs var:Extension ?>" title="Search Accounts">Search</a></li> -->
                            <!-- <li><a href="/accounts/create<?cs var:Extension ?>" title="Create Accounts">Create</a></li> -->
                        </ul>
                    </li>
                    <li><a href="/products/index<?cs var:Extension ?>" title="Products">Products</a>
                        <ul>
                            <li><a href="/legacy/productView">View</a></li>
                            <!-- <li><a href="/products/view<?cs var:Extension ?>" title="View Products">View</a></li> -->
                            <li><a href="/products/list<?cs var:Extension ?>" title="List Products">List</a></li>
                            <!-- <li><a href="/products/create<?cs var:Extension ?>" title="Create Products">Create</a></li> -->
                            <li><a href="/products/export<?cs var:Extension ?>" title="Export Products">Export</a></li>
                            <li><a href="/products/import<?cs var:Extension ?>" title="Import Products">Import</a></li>
                        </ul>
                    </li>
                    <li><a href="/subscriptions/index<?cs var:Extension ?>" title="Subscription Plans">Subscription Plans</a>
                        <ul>
                            <li><a href="/legacy/subscriptionView">Subscription View</a></li>
                            <!-- <li><a href="/subscriptions/view<?cs var:Extension ?>" title="View Subscriptions">View</a></li> -->
                            <!-- <li><a href="/subscriptions/list<?cs var:Extension ?>" title="List Subscriptions">List</a></li> -->
                            <!-- <li><a href="/subscriptions/create<?cs var:Extension ?>" title="Create Subscriptions">Create</a></li> -->
                        </ul>
                    </li>
                    <li><a href="/productkeys/index<?cs var:Extension ?>" title="Product Keys">Product Keys</a>
                        <ul>
                            <li><a href="/legacy/keygroupList">Activation Keys</a></li>
                            <!-- <li><a href="/productkeys/view<?cs var:Extension ?>" title="View Product Keys">View</a></li> -->
                            <!-- <li><a href="/productkeys/list<?cs var:Extension ?>" title="List Product Keys">List</a></li> -->
                            <!-- <li><a href="/productkeys/create<?cs var:Extension ?>" title="Create Product Keys">Create</a></li> -->
                        </ul>
                    </li>
                    <li><a href="/admin/index<?cs var:Extension ?>" title="Admin">Admin</a>
                        <ul>
                            <li><a href="/legacy/stats">Stats</a></li>
                            <!-- <li><a href="/admin/stats<?cs var:Extension ?>" title="Stats">Stats</a></li> -->
                            <!-- <li><a href="/admin/debug<?cs var:Extension ?>" title="Debug">Debug</a></li> -->
                            <li><a href="/admin/discounts<?cs var:Extension ?>" title="Discounts">Discounts</a></li>
							<li><a href="/admin/currency<?cs var:Extension ?>" title="Virtual Currencies">Virtual Currencies</a></li>
                            <li><a href="/admin/ipratelimit<?cs var:Extension ?>" title="IP Rate Limiting">IP Rate Limiting</a></li>
                        </ul>
                    </li>
                    <li><a href="/legacy/" title="Legacy Interface" style="background-color: #383">Legacy</a></li>
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
