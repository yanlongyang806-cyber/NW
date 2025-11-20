<script type="text/javascript">
$(document).ready(function() {
    disc_dialog = function(func) {
        return {
            autoOpen: false,
            modal: true,
            buttons: {
                "Cancel": function() {
                    $(this).dialog("close");
                },
                "Confirm": func
            }
        };
    };

    $('#fullDiscount').dialog(disc_dialog(function() {
        $('#discountForm').submit();
        $(this).dialog("close");
    }));

    $('#saveDiscount').click(function() {
        if (parseInt($('#percentageDiscount').val()) == 100) {
            $('#fullDiscount').dialog('open');
            return false;
        }

        return true;
    });

    var idToDelete = 0;

    $('#deleteConfirm').dialog(disc_dialog(function() {
        $('#deleteForm' + idToDelete).submit();
        $(this).dialog("close");
    }));

    $('.deleteDiscount').click(function() {
        idToDelete = $(this).siblings('.idToDelete').val();
        $('#deleteConfirm').dialog('open');
        return false;
    });

    $('#startTime').datetimepicker({
        dateFormat: 'yy-mm-dd',
        timeFormat: 'hh:mm:ss'
    });

    $('#endTime').datetimepicker({
        dateFormat: 'yy-mm-dd',
        timeFormat: 'hh:mm:ss'
    });

    $('#discount-tabs').tabs();

});
</script>

<div id="fullDiscount" title="Warning!" class="dialog">
    <p>Are you sure you wish to give a 100% discount?</p>
</div>

<div id="deleteConfirm" title="Warning!" class="dialog">
    <p>Are you sure you wish to permanently delete the discount?</p>
</div>

<?cs def:out_table(title, discounts) ?>
        <table class="tablesorter">
            <caption><?cs var:title ?></caption>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Created</th>
                    <th>Timeframe</th>
                    <th>Internal Product</th>
                    <th>Products</th>
                    <th>Categories</th>
                    <th>Discount</th>
                    <th>Prerequisites</th>
                    <th>Enabled</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?cs each:discount = discounts ?>
                <tr>
                    <td><?cs var:discount.UID ?></td>
                    <td><?cs alt:discount.Pname ?><i>None</i><?cs /alt ?></td>
                    <td>
                        <small>
                            <span class="shortss2000"><?cs var:discount.Ucreatedss2000 ?></span>
                            <span class="username"><?cs alt:discount.Pcreatedby ?><i>Unknown Creator</i><?cs /alt ?></span>
                        </small>
                    </td>
                    <td>
                        <small>
                            Starts: <span class="shortss2000"><?cs alt:discount.Ustartss2000 ?>Always<?cs /alt ?></span>
                        </small><br />
                        <small>
                            Ends: <span class="shortss2000"><?cs alt:discount.Uendss2000 ?>Never<?cs /alt ?></span>
                        </small>
                    </td>
                    <td><?cs alt:discount.Pproductinternalname ?><i>All</i><?cs /alt ?></td>
                    <td>
                        <?cs if:subcount(discount.Eaproducts) == 0 ?><i>All</i><?cs else ?>
                        <?cs if:discount.Bblacklistproducts ?>All except:<?cs else ?>Only:<?cs /if ?>
                        <small>
                            <?cs each:product = discount.Eaproducts ?><br /><?cs var:product ?><?cs /each ?>
                        </small>
                        <?cs /if ?>
                    </td>
                    <td>
                        <?cs if:subcount(discount.Eacategories) == 0 ?><i>All</i><?cs else ?>
                        <?cs if:discount.Bblacklistcategories ?>All except:<?cs else ?>Only:<?cs /if ?>
                        <small>
                            <?cs each:category = discount.Eacategories ?><br /><?cs var:category ?><?cs /each ?>
                        </small>
                        <?cs /if ?>
                    </td>
                    <td>
                        <?cs var:discount.Upercentagediscount / #100 ?>.<?cs if:discount.Upercentagediscount % #100 < 10 ?>0<?cs /if ?><?cs var:discount.Upercentagediscount % #100 ?>%
                        <?cs var:discount.Pcurrency ?>
                    </td>
                    <td><?cs if:discount.Pprereqsinfix == "1" ?>None<?cs else ?><?cs var:discount.Pprereqsinfix ?><?cs /if ?></td>
                    <td><?cs if:discount.Benabled ?>Enabled<?cs else ?>Disabled<?cs /if ?></td>
                    <td>
                        <form method="post" action="<?cs var:Self ?>" class="smallForm">
                            <div class="rowElem">
                                <input type="hidden" value="<?cs var:discount.Benabled ?>" name="disable" />
                                <input type="hidden" value="<?cs var:discount.UID ?>" name="id" />
                                <input class="submit" type="submit" value="<?cs if:discount.Benabled ?>Disable<?cs else ?>Enable<?cs /if ?>" name="setEnabled" />
                            </div>
                        </form>
                        <form method="post" action="<?cs var:Self ?>" class="smallForm deleteForm" id="deleteForm<?cs var:discount.UID ?>">
                            <div class="rowElem">
                                <input type="hidden" class="idToDelete" value="<?cs var:discount.UID ?>" name="id" />
                                <input type="hidden" name="delete" value="1" />
                                <input class="submit deleteDiscount" type="submit" value="Delete" />
                            </div>
                        </form>
                    </td>
                </tr>
                <?cs /each ?>
            </tbody>
        </table>
<?cs /def ?>
<br />
<div id="discount-tabs">
    <div id="discount-tab-list">
        <ul>
            <li><a href="#active-tab">Active Discounts</a></li>
            <li><a href="#scheduled-tab">Scheduled Discounts</a></li>
            <li><a href="#inactive-tab">Inactive Discounts</a></li>
        </ul>
    </div>
    <div id="active-tab">
        <?cs call:out_table("Active Discounts", Activediscounts) ?>
    </div>
    <div id="scheduled-tab">
        <?cs call:out_table("Scheduled Discounts", Scheduleddiscounts) ?>
    </div>
    <div id="inactive-tab">
        <?cs call:out_table("Inactive Discounts", Inactivediscounts) ?>
    </div>
</div>
<br />
<form method="post" action="<?cs var:Self ?>" class="verticalForm" id="discountForm">
    <h2>Create New Discount</h2>
    <fieldset>
        <div class="rowElem">
            <label for="name">Name:</label>
            <input type="text" name="name" id="name" value="<?cs var:Form.Name ?>"
                title="Only used for convenience.  Does not have to be unique, but should be." />
            <small>Example: Lifetimer discount</small>
        </div>
    </fieldset>
    <fieldset>
        <legend>Criteria</legend>
        <div class="rowElem">
            <label for="productInternalName">Internal Product:</label>
            <input type="text" name="productInternalName" id="productInternalName" value="<?cs var:Form.Productinternalname ?>"
                title="The internal name of the (game) product this discount applies to. If blank, applies to all." />
            <small>Example: FightClub</small>
        </div>
        <div class="rowElem">
            <label for="products">Products:</label>
            <input type="text" name="products" id="products" value="<?cs var:Form.Products ?>"
                title="A comma-separated list of products to which this discount applies. If blank, all products receive the discount." />
            <input type="checkbox" name="blacklistProducts" id="blacklistProducts" value="1" <?cs if:Form.Blacklistproducts ?>checked <?cs /if ?> />
            <small>Example: PRD-CO-M-AF-DrDestroyer, PRD-CO-M-AF-Kinetik<br />If the checkbox is checked, the list is treated as a blacklist, excluding the listed products from the discount.</small>
        </div>
        <div class="rowElem">
            <label for="categories">Categories:</label>
            <input type="text" name="categories" id="categories" value="<?cs var:Form.Categories ?>"
                title="A comma-separated list of categories to which this discount applies. If blank, all categories receive the discount." />
            <input type="checkbox" name="blacklistCategories" id="blacklistCategories" value="1" <?cs if:Form.Blacklistcategories ?>checked <?cs /if ?>/>
            <small>Example: FC.Actionfigures, FC.Items<br />If the checkbox is checked, this list is treated as a blacklist, excluding the listed categories from the discount.</small>
        </div>
        <div class="rowElem">
            <label for="startTime">Start Time:</label>
            <input type="text" name="startTime" id="startTime" value="<?cs var:Form.StartTime ?>"
                title="The date and time on which the discount becomes active. Must be specified as YYYY-MM-DD HH:MM:SS. If blank, the discount is active as soon as it is created." />
            <small>Example: 2011-02-07 10:00:00</small>
        </div>
        <div class="rowElem">
            <label for="endTime">End Time:</label>
            <input type="text" name="endTime" id="endTime" value="<?cs var:Form.EndTime ?>"
                title="The date and time on which the discount deactivates. Must be specified as YYYY-MM-DD HH:MM:SS. If blank, the discount never deactivates." />
            <small>Example: 2011-02-07 20:00:00</small>
        </div>
        <div class="rowElem">
            <label for="keyValuePrereqs">Prerequisites:</label>
            <input type="text" name="keyValuePrereqs" id="keyValuePrereqs" value="<?cs var:Form.Keyvalueprereqs ?>"
                title="The account must meet these prerequisites to get the discount. If '1', the discount applies to all accounts." />
            <small>Example: STO_Lifetime == 1</small>
        </div>
    </fieldset>
    <fieldset>
        <legend>Effect</legend>
        <div class="rowElem">
            <label for="currency">Currency:</label>
            <input type="text" name="currency" id="currency" value="<?cs var:Form.Currency ?>"
                title="Should be a valid point currency and begin with an underscore." />
            <small>Example: _CrypticPoints.</small>
        </div>
        <div class="rowElem">
            <label for="percentageDiscount">Percentage Discount:</label>
            <input type="text" name="percentageDiscount" id="percentageDiscount" value="<?cs var:Form.Percentagediscount ?>"
                title="Maximum two decimal places." />
            <small>Example: 30.00%</small>
        </div>
        <div class="rowElem">
            <input type="hidden" name="saveDiscount" value="1" />
            <input class="submit" type="submit" value="Add or Replace" id="saveDiscount" />
        </div>
    </fieldset>
</form>
