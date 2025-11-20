<script type="text/javascript">
$(document).ready(function() {
    $('#exportDialog').dialog({
        autoOpen: false,
        modal: true,
        buttons: {
            "Cancel": function() { 
                $(this).dialog("close"); 
            }, 
            "Export": function() { 
                open('<?cs var:Self ?>?export=1&desc=' + escape($('#desc').val()));
                $(this).dialog("close");
                location.reload();
            } 
        }
    });

    $('#export').click(function() {
        $('#exportDialog').dialog('open');
        return true;
    });
});
</script>

<div id="exportDialog" title="Export">
    <p>Please enter a description for the export.</p>

	<form>
        <fieldset>
            <div class="rowElem">
                <label for="name">Description</label>
                <input type="text" name="desc" id="desc" class="text ui-widget-content ui-corner-all"
                    title="Description of the export; purely informational." />
            </div>
        </fieldset>
	</form>
</div>

<p>This is the list of products that will be exported.  Click <a href="#" id="export">here</a> to download the export.</p>
<?cs include:"ProductsList.cs" ?>
