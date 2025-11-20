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

        $('#deprecateconfirm').dialog({
            autoOpen: false,
            modal: true,
            buttons: {
                "Cancel": function() {
                    $(this).dialog("close");
                },
                "Confirm": function() {
                    $('#deprecateform' + idToDeprecate).submit();
                    $(this).dialog("close");
                }
            }
        });

        $('.deleteCurrency').click(function() {
            idToDelete = $(this).siblings('.idToDelete').val();
            $('#deleteconfirm').dialog('open');
            return false;
        });

        $('#created').datetimepicker({
            dateFormat: 'yy-mm-dd',
            timeFormat: 'hh:mm:ss'
        });

        $('#deprecated').datetimepicker({
            dateFormat: 'yy-mm-dd',
            timeFormat: 'hh:mm:ss'
        });

        // Ridiculously hacky code that really shouldn't be necessary to deal with jqTransform's bullshit
        var desiredVal = <?cs if:Form.Revenuetype == 0 ?>"Promotional"<?cs elif:Form.Revenuetype == 1 ?>"Paid"<?cs else ?>"Ambiguous"<?cs /if ?>;
        var revType = $('#revenuetype');
        var option = revType.find('option[value='+desiredVal+']');
        var index = $('#revenuetype option').index(option);
        revType.prev('ul').find('li').eq(index).find('a').click();
    });
</script>

<div id="deleteconfirm" title="Warning!">
    <p>Are you sure you wish to permanently delete the currency?</p>
</div>

<div id="deprecateconfirm" title="Warning!">
    <p>Are you sure you wish to deprecate the currency?</p>
</div>

<table class="tablesorter">
    <caption>Currencies</caption>
    <thead>
        <tr>
            <th>Name</th>
            <th>Game</th>
            <th>Environment</th>
            <th>Created</th>
            <th>Deprecated</th>
            <th>Reporting ID</th>
            <th>Revenue Type</th>
            <th>Chain Parts</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        <?cs each:currency = Currencies ?>
        <tr>
            <td><?cs var:currency.Pname ?></td>
            <td><?cs var:currency.Pgame ?></td>
            <td><?cs var:currency.Penvironment ?></td>
            <td><div class="shortss2000"><?cs var:currency.Ucreatedtime ?></div></td>
            <td><?cs if:currency.Udeprecatedtime ?><div class="shortss2000"><?cs var:currency.Udeprecatedtime ?></div><?cs else ?>N/A<?cs /if ?></td>
            <td><?cs var:currency.Ureportingid ?></td>
            <td><?cs if:currency.Erevenuetype == 0 ?>Promotional<?cs elif:currency.Erevenuetype == 1 ?>Paid<?cs else ?>Ambiguous<?cs /if ?></td>
            <td><?cs if:currency.Bischain ?>
                <?cs each:part = currency.Ppchainparts ?><?cs var:part ?><br /><?cs /each ?>
                <?cs else ?>N/A<?cs /if ?></td>
			<td>
                <form method="post" action="<?cs var:Self ?>" class="smallForm" id="editForm<?cs var:currency.Uid ?>">
                    <div class="rowElem">
                        <input type="hidden" class="idToEdit" value="<?cs var:currency.UID ?>" name="id" />
                        <input type="hidden" name="edit" value="1" />
                        <input class="submit editCurrency" type="submit" value="Edit" />
                    </div>
                </form>
                <form method="post" action="<?cs var:Self ?>" class="smallForm deleteForm" id="deleteForm<?cs var:currency.UID ?>">
                    <div class="rowElem">
                        <input type="hidden" class="idToDelete" value="<?cs var:currency.UID ?>" name="id" />
                        <input type="hidden" name="delete" value="1" />
                        <input class="submit deleteCurrency" type="submit" value="Delete" />
                    </div>
                </form>
            </td>
        </tr>
        <?cs /each ?>
    </tbody>
</table>
<br />
<form method="post" action="<?cs var:Self ?>" class="verticalForm" id="currencyForm">
    <fieldset>
        <legend>Add or Replace Currency</legend>
        <div class="rowElem">
            <label for="name">Name:</label>
            <input type="text" name="name" id="name" value="<?cs var:Form.Name ?>"
                title="Must be unique." />
            <small>Example: PromoStarTrekZen</small>
        </div>
        <div class="rowElem">
            <label for="game">Game:</label>
            <input type="text" name="game" id="game" value="<?cs var:Form.Game ?>" 
                title="Internal name of game with which this currency is associated." />
            <small>Example: StarTrek</small>
        </div>
		<div class="rowElem">
			<label for="environment">Environment:</label>
			<input type="text" name="environment" id="environment" value="<?cs var:Form.Environment ?>"
                title="Environment in which this currency is used. (Valid options: Live, PTS, Beta, Dev)" />
			<small>Example: Live</small>
		</div>
		<div class="rowElem">
			<label for="created">Created:</label>
			<input type="text" name="created" id="created" value="<?cs var:Form.Createdtime ?>"
                title="Timestamp when this currency was created. Leave blank for 'now'." />
			<small>Example: 2012-07-12 07:00:00</small>
		</div>
		<div class="rowElem">
			<label for="deprecated">Deprecated:</label>
			<input type="text" name="deprecated" id="deprecated" value="<?cs var:Form.Deprecatedtime ?>"
                title="Timestamp when this currency was deperecated. Leave blank for 'not yet'." />
			<small>Example: 2012-12-21 00:00:00</small>
		</div>
		<div class="rowElem">
			<label for="reportingid">Reporting ID:</label>
			<input type="text" name="reportingid" id="reportingid" value="<?cs var:Form.Ureportingid ?>"
                title="ID to use in the reporting database for this currency. (Must be unique!)" />
			<small>Example: 18</small>
		</div>
		<div class="rowElem">
			<label for="revenuetype">Revenue Type:</label>
			<select name="revenuetype" id="revenuetype"
                title="Type of revenue recognition to apply for this currency.">
				<option>Promotional
				<option>Paid
				<option>Ambiguous
			</select>
			<small>Example: Promotional</small>
		</div>
		<div class="rowElem">
			<label for="ischain">Is Chain:</label>
			<input type="checkbox" name="ischain" id="ischain" value="1" <?cs if:Form.Ischain ?>checked <?cs /if ?>
                title="If selected, the currency is a chain of other currencies." />
		</div>
		<div class="rowElem">
			<label for="parts">Chain Parts:</label>
			<input type="text" name="parts" id="parts" value="<?cs var:Form.Chainparts ?>"
                title="Comma-separated list of currencies in the chain." />
			<small>Example: PromoStarTrekZen, PaidStarTrekZen</small>
		</div>
        <div class="rowElem">
            <input type="hidden" name="saveCurrency" value="1" />
            <input class="submit" type="submit" value="Add or Replace" id="saveCurrency" />
        </div>
    </fieldset>
</form>
