<?cs if:subcount(Entries) > 0 ?>
<table class="tablesorter">
    <caption>Subscriptions</caption>
    <thead>
        <tr>
            <th>Subscription Plan</th>
            <th>Internal Name</th>
            <th>Period</th>
            <th>Description</th>
        </tr>
    </thead>
    <tbody>
        <?cs each:entry = Entries ?>
        <tr>        
            <td><a href="<?cs var:Viewpage ?>?name=<?cs var:entry.Name ?>" title="View Subscription"><?cs var:entry.Name ?></a></td>
            <td><?cs var:entry.Internalname ?></td>
            <td><?cs var:entry.Period ?></td>
            <td><?cs var:entry.Description ?></td>
        </tr>
        <?cs /each ?>
    </tbody>
</table>
<?cs /if ?>
