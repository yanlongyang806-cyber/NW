<form method="post" action="<?cs var:Self ?>" enctype="multipart/form-data" class="verticalForm">
    <fieldset>
        <legend>Import Products File</legend>
        <div class="rowElem">
            <label for="importFile">Import File:</label>
            <input type="file" name="importFile" id="importFile"
                title="Should be a file exported by an account server." />
        </div>
        <div class="rowElem">
            <input class="submit" type="submit" value="Import" name="import" />
        </div>
    </fieldset>
</form>

<?cs include:"ProductsList.cs" ?>
