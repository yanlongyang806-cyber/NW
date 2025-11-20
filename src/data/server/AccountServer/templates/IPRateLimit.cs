<table class="tablesorter">
    <caption>Blocked IP Addresses</caption>
    <thead>
        <tr>
            <th>IP Address</th>
            <th>Blocked Until</th>
        </tr>
    </thead>
    <tbody>
        <?cs each:entry = Ipratelimit ?>
        <tr>
            <td><?cs var:entry.Ipaddress ?></td>
            <td><div class="shortss2000"><?cs var:entry.Ublockeduntilss2000 ?></div></td>
        </tr>
        <?cs /each ?>
    </tbody>
</table>
