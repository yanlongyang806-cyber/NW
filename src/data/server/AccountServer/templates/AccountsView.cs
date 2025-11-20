<script type="text/javascript">
$(document).ready(function() {
    $('#account-tabs').tabs();
});
</script>
<?cs if:(Account.AccountName || Pweaccount.Paccountname) ?>
<div id="account-tabs">
    <ul>
        <?cs if:(Account.AccountName) ?><li><a href="#general-tab">Cryptic</a></li><?cs /if ?>
        <?cs if:(Pweaccount.Paccountname) ?><li><a href="#pwe-tab">PWE</a></li><?cs /if ?>
        <?cs if:(Account.AccountName) ?><li><a href="#products-tab">Products</a></li><?cs /if ?>
        <?cs if:(Account.AccountName) ?><li><a href="#permissions-tab">Permissions</a></li><?cs /if ?>
        <?cs if:(Account.AccountName) ?><li><a href="#billing-tab">Billing</a></li><?cs /if ?>
        <?cs if:(Account.AccountName) ?><li><a href="#activity-tab">Activity Log</a></li><?cs /if ?>
    </ul>
    <?cs if:(Account.AccountName) ?>
    <div id="general-tab">
        <section title="Cryptic Info">
            <h2>Cryptic Info</h2>
            <div>
                <span class="label">Account Name:</span> <?cs var:Account.AccountName ?>
            </div>
            <div>
                <span class="label">Display Name:</span> <?cs var:Account.DisplayName ?>
            </div>
            <div>
                <span class="label">GUID:</span> <?cs var:Account.Globallyuniqueid ?>
            </div>
            <div>
                <span class="label">Account ID:</span> <?cs var:Account.UID ?>
            </div>
            <div>
                <span class="label">Creation:</span> <span class="shortss2000"><?cs var:Account.Ucreatedtime ?></span>
            </div>
        </section>
        <section title="Personal Info">
            <h2>Personal Info</h2>
            <div>
                <span class="label">E-mail:</span> <?cs var:Account.Personalinfo.Email ?>
            </div>
            <div>
                <span class="label">First Name:</span> <?cs var:Account.Personalinfo.Firstname ?>
            </div>
            <div>
                <span class="label">Last Name:</span> <?cs var:Account.Personalinfo.Lastname ?>
            </div>
        </section>
        <section title="Useful Links">
            <h2>Useful Links</h2>
            <a href="<?cs var:Servermonitorlink ?>">[server monitor]</a>
            <a href="<?cs var:Legacylink ?>">[legacy link]</a>
        </section>
    </div>
    <?cs /if ?>
    <?cs if:(Pweaccount.Paccountname) ?>
    <div id="pwe-tab">
        <section title="Perfect World Info">
            <h2>Perfect World Info</h2>
            <div>
                <span class="label">Account Name:</span> <?cs var:Pweaccount.Paccountname ?>
            </div>
            <div>
                <span class="label">Forum Name:</span> <?cs var:Pweaccount.Pforumname ?>
            </div>
            <div>
                <span class="label">E-mail:</span> <?cs var:Pweaccount.Pemail ?>
            </div>
            <div>
                <span class="label">Batch ID:</span> <?cs var:Pweaccount.Ubatchid ?>
            </div>
            <div>
                <span class="label">Registration Page:</span> <?cs var:Pweaccount.Pregistrationpage ?>
            </div>
            <div>
                <span class="label">Banned:</span> <?cs if:Pweaccount.Bbanned ?>yes<?cs else ?>no<?cs /if ?>
            </div>
        </section>
    </div>
    <?cs /if ?>
    <?cs if:(Account.AccountName) ?>
    <div id="products-tab">
        <table class="tablesorter">
            <caption>Associated Products</caption>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Key Used</th>
                    <th>Date Associated</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                <?cs each:product = Account.Ppproducts ?>
                <tr>
                    <td><?cs var:product.Name ?></td>
                    <td><?cs var:product.Key ?></td>
                    <td><span class="shortss2000"><?cs var:product.Uassociatedtimess2000 ?></span></td>
                    <td></td>
                </tr>
                <?cs /each ?>
            </tbody>
        </table>
    </div>
    <div id="permissions-tab">
		<section title="Employee Status">
            <h2>Employee Status</h2>
			<?cs if:(Pweaccount.Paccountname) ?>
				<div>
					<span class="label">Perfect World E-mail:</span> <?cs var:Pweaccount.Pemail ?>
				</div>
			<?cs /if ?>
			<div>
                <span class="label">Cryptic E-mail:</span> <?cs var:Account.Personalinfo.Email ?>
            </div>
            <div>
				<form method="post" action="<?cs var:Self ?>#permissions-tab" class="smallForm">
					<span class="label">Employee Status:</span> <?cs var:Employeestatustext ?>
					<input type="hidden" name="id" value="<?cs var:Account.UID ?>" />
					<input class="submit" type="submit" name="toggleEmployeeStatus" value="Toggle"/>
                </form>
            </div>
        </section>
    </div>
    <div id="billing-tab">
    </div>
    <div id="activity-tab">
        <table class="tablesorter">
            <caption>Activity Log</caption>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Message</th>
                </tr>
            </thead>
            <tbody>
                <?cs each:activity = Activities ?>
                <tr>
                    <td><nobr><span class="shortss2000"><?cs var:activity.Utime ?></span></nobr></td>
                    <td><?cs var:activity.Message ?></td>
                </tr>
                <?cs /each ?>
            </tbody>
        </table>
    </div>
    <?cs /if ?>
</div>
<?cs else ?>
<form method="get" action="<?cs var:Self ?>" class="verticalForm">
    <h2>View Account</h2>
    <fieldset>
        <legend>Cryptic Identifiers</legend>
        <div class="rowElem">
            <label for="id">ID:</label>
            <input type="text" name="id" value=""
                title="Cryptic account ID" />
            <small>Example: 1</small>
        </div>
        <div class="rowElem">
            <label for="name">Name:</label>
            <input type="text" name="name" value=""
                title="Cryptic account name" />
            <small>Example: cogden</small>
        </div>
        <div class="rowElem">
            <label for="display_name">Display name:</label>
            <input type="text" name="display_name" value=""
                title="Cryptic display name (handle)" />
            <small>Example: cogden</small>
        </div>
        <div class="rowElem">
            <label for="guid">GUID:</label>
            <input type="text" name="guid" value=""
                title="Cryptic account GUID" />
            <small>Example: 450TCYVIYYQ8</small>
        </div>
        <div class="rowElem">
            <label for="email">E-mail:</label>
            <input type="text" name="email" value=""
                title="Cryptic account e-mail address" />
            <small>Example: cogden@crypticstudios.com</small>
        </div>
    </fieldset>
    <fieldset>
        <legend>Perfect World Identifiers</legend>
        <div class="rowElem">
            <label for="pwe_name">Name:</label>
            <input type="text" name="pwe_name" value=""
                title="PWE account name" />
            <small>Example: crypticcogden</small>
        </div>
        <div class="rowElem">
            <label for="pwe_email">E-mail:</label>
            <input type="text" name="pwe_email" value=""
                title="PWE account e-mail address" />
            <small>Example: cogden@crypticstudios.com</small>
        </div>
    </fieldset>
    <fieldset>
        <div class="rowElem">
            <input class="submit" type="submit" value="View Account" />
        </div>
    </fieldset>
</form>

<?cs /if ?>
