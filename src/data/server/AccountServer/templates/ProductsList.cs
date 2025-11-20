<?cs if:subcount(Entries) > 0 ?>
<table class="tablesorter">
    <caption>Products</caption>
    <thead>
        <tr>
            <th>Name</th>
            <th>Categories</th>
            <th>Internal Name</th>
            <th>Shards</th>
            <th>Permissions</th>
            <th>Required Subs</th>
            <th>Billing Sync</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        <?cs each:entry = Entries ?>
        <tr>        
            <td><a href="<?cs var:Viewpage ?>?name=<?cs var:entry.Name ?>" title="View Product"><?cs var:entry.Name ?></a></td>
            <td><?cs var:entry.Categories ?></td>
            <td><?cs var:entry.Internalname ?></td>
            <td><?cs var:entry.Shards ?></td>
            <td><?cs var:entry.Permissions ?></td>
            <td><?cs var:entry.Requiredsubs ?></td>
            <td><?cs if:entry.Sync ?>Yes<?cs else ?>No<?cs /if ?></td>
            <td>
                <form method="post" action="<?cs var:Self ?>" class="smallForm">
                    <div>
                        <input type="hidden" name="product" value="<?cs var:entry.Name ?>" />
                        <?cs if:entry.Settoexport ?>
                            <input class="submit" type="submit" name="unexport" value="Remove from Export" />
                        <?cs else ?>
                            <input class="submit" type="submit" name="export" value="Add to Export" />
                        <?cs /if ?>
                    </div>
                </form>
            </td>
        </tr>
        <?cs /each ?>
    </tbody>
</table>
<?cs /if ?>
