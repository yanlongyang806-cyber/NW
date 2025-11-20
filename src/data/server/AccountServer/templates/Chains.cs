<script type="text/javascript">
$(document).ready(function() {
    var idToDelete = 0;

    $('#deleteconfirm').dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "Cancel": function() { 
                $(this).dialog("close"); 
            }, 
            "Confirm": function() { 
                $('#deleteForm' + idToDelete).submit();
                $(this).dialog("close");
            } 
        }
    });

    $('.deleteChain').click(function() {
        idToDelete = $(this).siblings('.idToDelete').val();
        $('#deleteconfirm').dialog('open');
        return false;
    });

});
</script>

<div id="deleteconfirm" title="Warning!">
    <p>Are you sure you wish to permanently delete the chain?</p>
</div>

<table class="tablesorter">
    <caption>Chains</caption>
    <thead>
        <tr>
            <th>Alias</th>
            <th>Chain</th>
            <th colspan="2">Actions</th>
        </tr>
    </thead>
    <tbody>
        <?cs each:chain = Chains ?>
        <tr>
            <td><?cs var:chain.Palias ?></td>
            <td>
                <?cs each:item = chain.Eaelements ?>
                    <?cs var:item.Fcoefficient ?> <?cs var:item.Pkey ?>,  
                <?cs /each ?>
            </td>
            <td>
                <form method="post" action="<?cs var:Self ?>" class="smallForm deleteForm" id="deleteForm<?cs var:chain.Ucontainerid ?>">
                    <div class="rowElem">
                        <input type="hidden" class="idToDelete" value="<?cs var:chain.Ucontainerid ?>" name="id" />
                        <input type="hidden" name="delete" value="1" />
                        <input class="submit deleteDiscount" type="submit" value="Delete" />
                    </div>
                </form>
            </td>
        </tr>
        <?cs /each ?>
    </tbody>
</table>

<form method="post" action="<?cs var:Self ?>" class="verticalForm" id="chainsForm">
    <fieldset>
        <legend>Add or Replace Chain</legend>
        <div class="rowElem">
            <label for="alias">Alias:</label>
            <input type="text" name="alias" id="alias" value="<?cs var:Form.Alias ?>" />
            <div class="tooltip">Must be unique.</div>
            <small>Example: COChain</small>
        </div>
        <div class="rowElem">
            <label for="chain">Chain:</label>
            <input type="text" name="chain" id="chain" value="<?cs var:Form.Chain ?>" />
            <div class="tooltip">Comma-separated list of keyvalues with coefficients.</div>
            <small>Example: 1 CrypticPoints, 1 AtariTokens</small>
        </div>
        <div class="rowElem">
            <input type="hidden" name="saveChain" value="1" />
            <input class="submit" type="submit" value="Add or Replace" id="saveChain" />
        </div>
    </fieldset>
</form>
