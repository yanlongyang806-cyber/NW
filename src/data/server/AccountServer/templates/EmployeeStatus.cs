<div id="account-server-config">
	<h2>Account Server Config</h2>
	<div>
		<span class="label">Verify Employee Status:</span> <?cs if: (Accountserverconfig.Verifyemployeestatus) ?>true<?cs else?>false<?cs /if?>
	</div>
	<div>
		<span class="label">Valid Employee Email Domains:</span>
		<table>
			<tbody>
				<?cs each:entry = Accountserverconfig.Employeeemaildomains ?>
				<tr>
					<td><?cs var:entry ?></td>
					</td>
				</tr>
				<?cs /each ?>
			</tbody>
		</table>
	</div>
</div>
<div id="employee-status">
	<h2>Employee Status</h2>
	<table class="tablesorter">
		<thead>
			<tr>
				<th>Name</th>
				<th>Employee Status</th>
				<th>Cryptic Email</th>
				<th>Perfect World Email</th>
			</tr>
		</thead>
		<tbody>
			<?cs each:entry = Entries ?>
			<tr>
				<td><a href="<?cs var:Viewpage ?>?name=<?cs var:entry.Accountinfo.AccountName ?>" title="View Account"><?cs var:entry.Accountinfo.AccountName ?></a></td>
				<td><?cs var:entry.Employeestatustext ?></td>
				<td><a href="<?cs var:Viewpage ?>?email=<?cs var:entry.Accountinfo.Personalinfo.Email ?>" title="View Account"><?cs var:entry.Accountinfo.Personalinfo.Email ?></a></td>
				<td><a href="<?cs var:Viewpage ?>?pwe_email=<?cs var:entry.Pwaccount.Pemail ?>" title="View Account"><?cs var:entry.Pwaccount.Pemail ?></a></td>
			</tr>
			<?cs /each ?>
		</tbody>
	</table>
</div>